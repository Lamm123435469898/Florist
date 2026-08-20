FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["Backend/Florist.API/Florist.API.csproj", "Backend/Florist.API/"]
COPY ["Backend/Florist.Application/Florist.Application.csproj", "Backend/Florist.Application/"]
COPY ["Backend/Florist.Domain/Florist.Domain.csproj", "Backend/Florist.Domain/"]
COPY ["Backend/Florist.Infrastructure/Florist.Infrastructure.csproj", "Backend/Florist.Infrastructure/"]
RUN dotnet restore "Backend/Florist.API/Florist.API.csproj"

COPY . .
WORKDIR "/src/Backend/Florist.API"
RUN dotnet build "Florist.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Florist.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Florist.API.dll"]
