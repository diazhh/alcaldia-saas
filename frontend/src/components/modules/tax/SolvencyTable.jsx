'use client';

import { useState, useEffect } from 'react';
import { Eye, Search, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';

export default function SolvencyTable({ onView }) {
  const { token } = useAuth();
  const [solvencies, setSolvencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSolvencies();
  }, []);

  const fetchSolvencies = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/tax/solvencies`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSolvencies(response.data);
    } catch (error) {
      console.error('Error fetching solvencies:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSolvencies = solvencies.filter(solvency =>
    solvency.solvencyNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    solvency.taxpayer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const variants = {
      ACTIVE: { variant: 'default', label: 'Vigente' },
      EXPIRED: { variant: 'destructive', label: 'Vencida' },
      REVOKED: { variant: 'outline', label: 'Revocada' },
    };
    return variants[status] || variants.ACTIVE;
  };

  if (loading) {
    return <Card><CardContent className="py-8"><p className="text-center text-muted-foreground">Cargando solvencias...</p></CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Solvencias Emitidas</CardTitle>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8 w-[300px]" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Solvencia</TableHead>
              <TableHead>Contribuyente</TableHead>
              <TableHead>Fecha Emisión</TableHead>
              <TableHead>Fecha Vencimiento</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSolvencies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No se encontraron solvencias</TableCell>
              </TableRow>
            ) : (
              filteredSolvencies.map((solvency) => {
                const statusInfo = getStatusBadge(solvency.status);
                return (
                  <TableRow key={solvency.id}>
                    <TableCell className="font-medium">{solvency.solvencyNumber}</TableCell>
                    <TableCell>{solvency.taxpayer?.name}</TableCell>
                    <TableCell>{new Date(solvency.issueDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(solvency.expiryDate).toLocaleDateString()}</TableCell>
                    <TableCell><Badge variant={statusInfo.variant}>{statusInfo.label}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => onView(solvency)}><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon"><Download className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
