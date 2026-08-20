using Florist.Application.Interfaces.Repositories;
using Florist.Application.Interfaces;
using Florist.Domain.Enums;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Florist.Infrastructure.BackgroundJobs
{
    public class OrderCleanupBackgroundService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<OrderCleanupBackgroundService> _logger;

        public OrderCleanupBackgroundService(IServiceProvider serviceProvider, ILogger<OrderCleanupBackgroundService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("OrderCleanupBackgroundService is starting.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await CleanupAbandonedOrdersAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred executing OrderCleanupBackgroundService.");
                }

                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }
        }

        private async Task CleanupAbandonedOrdersAsync()
        {
            using var scope = _serviceProvider.CreateScope();
            var orderRepo = scope.ServiceProvider.GetRequiredService<IOrderRepository>();
            var inventoryService = scope.ServiceProvider.GetRequiredService<IInventoryService>();
            var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

            // Find PENDING orders older than 15 minutes
            var cutoffTime = DateTime.UtcNow.AddMinutes(-15);
            var abandonedOrders = await orderRepo.GetAbandonedOrdersAsync(cutoffTime);

            if (abandonedOrders.Count == 0) return;

            _logger.LogInformation($"Found {abandonedOrders.Count} abandoned orders to clean up.");

            foreach (var order in abandonedOrders)
            {
                await unitOfWork.BeginTransactionAsync();
                try
                {
                    order.Status = OrderStatus.CANCELLED;
                    await orderRepo.UpdateAsync(order);

                    if (order.OrderItems != null)
                    {
                        foreach (var item in order.OrderItems)
                        {
                            await inventoryService.ReleaseStockAsync(item.ProductVariantId, item.Quantity, order.Id.ToString());
                        }
                    }

                    await unitOfWork.CommitTransactionAsync();
                    _logger.LogInformation($"Successfully cancelled abandoned order {order.Id} and released inventory.");
                }
                catch (Exception ex)
                {
                    await unitOfWork.RollbackTransactionAsync();
                    _logger.LogError(ex, $"Failed to clean up order {order.Id}.");
                }
            }
        }
    }
}
