import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { AdminLayout } from "@/components/admin-layout";
import { Loader2, Search, Filter, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: string | null;
  createdAt: string;
}

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get(`/admin/audit-logs?page=${page}&pageSize=50`);
      if (data.success) {
        setLogs(data.data.items);
        setTotalCount(data.data.totalCount);
      }
    } catch {
      toast.error("Không thể tải lịch sử hoạt động");
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const searchMatch = 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) || 
      log.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.ipAddress && log.ipAddress.includes(searchQuery)) ||
      (log.userId && log.userId.includes(searchQuery));
    
    const actionMatch = actionFilter === "all" || log.action.toLowerCase() === actionFilter.toLowerCase();
    
    return searchMatch && actionMatch;
  });

  const uniqueActions = Array.from(new Set(logs.map(l => l.action)));

  return (
    <AdminLayout title="Audit Logs (Nhật ký hệ thống)">
      <div className="space-y-6">
        
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex-1 w-full relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo hành động, IP, Resource..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-lg text-sm focus:outline-none focus:bg-white focus:border-[hsl(154,35%,30%)] focus:ring-1 focus:ring-[hsl(154,35%,30%)] transition-all"
            />
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full sm:w-[200px] h-10 bg-white border-gray-200">
                <Filter className="w-4 h-4 mr-2 text-gray-500" />
                <SelectValue placeholder="Lọc theo hành động" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả hành động</SelectItem>
                {uniqueActions.map(action => (
                  <SelectItem key={action} value={action}>{action}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={fetchLogs} variant="outline" className="h-10">
              Làm mới
            </Button>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          {loading && logs.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-[hsl(154,35%,30%)]" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 bg-gray-50/80 uppercase font-medium border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4">Thời gian</th>
                      <th className="px-6 py-4">Hành động</th>
                      <th className="px-6 py-4">Resource</th>
                      <th className="px-6 py-4">Người dùng</th>
                      <th className="px-6 py-4">IP Address</th>
                      <th className="px-6 py-4 text-right">Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-xs">
                          {new Date(log.createdAt).toLocaleString('vi-VN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{log.resource}</div>
                          {log.resourceId && <div className="text-xs text-gray-400 font-mono mt-0.5">{log.resourceId}</div>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {log.userId ? (
                            <span className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">{log.userId.substring(0, 8)}...</span>
                          ) : (
                            <span className="text-xs text-gray-400 italic">System / Unknown</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-xs font-mono">
                          {log.ipAddress || '-'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="ghost" size="sm" className="h-8 text-xs font-medium" onClick={() => {
                            toast.message("Chi tiết Metadata", {
                              description: (
                                <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
                                  <code className="text-white text-xs">{log.metadata || 'Không có dữ liệu metadata'}</code>
                                </pre>
                              ),
                              duration: 5000,
                            })
                          }}>
                            Xem Meta
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {filteredLogs.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                          <ShieldAlert className="w-8 h-8 mx-auto mb-3 opacity-20" />
                          <p>Không tìm thấy lịch sử hoạt động nào.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="mt-auto p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-sm text-gray-500">
                <div>
                  Hiển thị {filteredLogs.length} / {totalCount} bản ghi (Trang {page})
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    Trang trước
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={logs.length < 50}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Trang sau
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </AdminLayout>
  );
}
