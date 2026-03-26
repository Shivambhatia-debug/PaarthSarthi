"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Eye, ExternalLink } from "lucide-react"

interface EntityTableProps {
    title: string
    items: any[]
    renderRow: (item: any) => React.ReactNode
    onAdd?: () => void
    icon: any
}

export function EntityTable({ title, items, renderRow, onAdd, icon: Icon }: EntityTableProps) {
    return (
        <Card className="bg-white/[0.02] border-white/[0.06] h-full flex flex-col">
            <CardHeader className="pb-3 px-5 pt-5 flex flex-row items-center justify-between shrink-0">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                    <Icon className="w-4 h-4 text-blue-400" />
                    {title} ({items.length})
                </CardTitle>
                {onAdd && (
                    <Button size="sm" onClick={onAdd} className="bg-blue-600 hover:bg-blue-700 h-8 text-xs">
                        Add New
                    </Button>
                )}
            </CardHeader>
            <CardContent className="px-0 pb-0 flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto px-5 pb-5">
                    <div className="space-y-2">
                        {items.length === 0 ? (
                            <p className="text-center py-10 text-gray-500 text-sm">No items found</p>
                        ) : (
                            items.map((item) => renderRow(item))
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
