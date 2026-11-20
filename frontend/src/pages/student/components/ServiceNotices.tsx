import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type Notice = { title: string; time: string; status: string }

/** Student-visible service and safety updates. */
export function ServiceNotices({ notices }: { notices: Notice[] }) {
  return (
    <Card id="service-notices" className="dashboard-card min-w-0">
      <CardHeader><CardDescription>Updates</CardDescription><CardTitle>Service notices</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>Notice</TableHead><TableHead>Time</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>
            {notices.map((notice) => (
              <TableRow key={notice.title}>
                <TableCell>{notice.title}</TableCell><TableCell>{notice.time}</TableCell>
                <TableCell><Badge variant={notice.status === 'Resolved' ? 'success' : 'secondary'}>{notice.status}</Badge></TableCell>
              </TableRow>
            ))}
            {!notices.length ? <TableRow><TableCell colSpan={3} className="py-8 text-center text-muted-foreground">No service notices right now.</TableCell></TableRow> : null}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
