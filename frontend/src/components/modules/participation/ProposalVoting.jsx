'use client';

import { useState } from 'react';
import { Vote, CheckCircle, DollarSign, Users, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PROPOSAL_STATUS, PROPOSAL_STATUS_LABELS } from '@/constants';
import { voteProposal } from '@/services/participation.service';
import { useToast } from '@/hooks/use-toast';

/**
 * Interfaz de votación de propuestas
 */
export default function ProposalVoting({ proposals, onVoteSuccess }) {
  const { toast } = useToast();
  const [votedProposals, setVotedProposals] = useState(new Set());
  const [voting, setVoting] = useState(false);
  const [voterEmail, setVoterEmail] = useState('');
  const [voterName, setVoterName] = useState('');

  /**
   * Formatear moneda
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  /**
   * Votar por una propuesta
   */
  const handleVote = async (proposalId) => {
    if (!voterEmail.trim()) {
      toast({
        title: 'Error',
        description: 'Por favor ingresa tu correo electrónico para votar',
        variant: 'destructive',
      });
      return;
    }

    if (!voterName.trim()) {
      toast({
        title: 'Error',
        description: 'Por favor ingresa tu nombre para votar',
        variant: 'destructive',
      });
      return;
    }

    try {
      setVoting(true);
      await voteProposal(proposalId, {
        voterEmail,
        voterName,
      });

      setVotedProposals((prev) => new Set([...prev, proposalId]));
      
      toast({
        title: '¡Voto registrado!',
        description: 'Tu voto ha sido registrado exitosamente',
      });

      onVoteSuccess?.();
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: 'Error',
        description:
          error.response?.data?.message ||
          'No se pudo registrar tu voto. Verifica que no hayas votado antes.',
        variant: 'destructive',
      });
    } finally {
      setVoting(false);
    }
  };

  /**
   * Filtrar propuestas aprobadas
   */
  const approvedProposals = proposals.filter(
    (p) => p.status === PROPOSAL_STATUS.APPROVED
  );

  if (approvedProposals.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          No hay propuestas disponibles para votación en este momento.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Información del votante */}
      <Card>
        <CardHeader>
          <CardTitle>Tus datos para votar</CardTitle>
          <CardDescription>
            Necesitamos tu información para validar tu voto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="voterName">Nombre completo</Label>
              <Input
                id="voterName"
                placeholder="Tu nombre"
                value={voterName}
                onChange={(e) => setVoterName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="voterEmail">Correo electrónico</Label>
              <Input
                id="voterEmail"
                type="email"
                placeholder="tu@email.com"
                value={voterEmail}
                onChange={(e) => setVoterEmail(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de propuestas */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">
          Propuestas disponibles ({approvedProposals.length})
        </h3>
        {approvedProposals.map((proposal) => {
          const hasVoted = votedProposals.has(proposal.id);
          
          return (
            <Card key={proposal.id} className={hasVoted ? 'bg-green-50' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{proposal.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {proposal.description}
                    </CardDescription>
                  </div>
                  {hasVoted && (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Votado
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Información de la propuesta */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-gray-500 text-xs">Costo estimado</p>
                      <p className="font-medium">
                        {formatCurrency(proposal.estimatedCost)}
                      </p>
                    </div>
                  </div>

                  {proposal.beneficiaries && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-500 text-xs">Beneficiarios</p>
                        <p className="font-medium">{proposal.beneficiaries}</p>
                      </div>
                    </div>
                  )}

                  {proposal.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-500 text-xs">Ubicación</p>
                        <p className="font-medium">{proposal.location}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Justificación */}
                {proposal.justification && (
                  <div>
                    <p className="text-sm font-medium mb-1">Justificación:</p>
                    <p className="text-sm text-gray-600">{proposal.justification}</p>
                  </div>
                )}

                {/* Votos actuales */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Vote className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {proposal._count?.votes || 0} voto(s)
                    </span>
                  </div>

                  <Button
                    onClick={() => handleVote(proposal.id)}
                    disabled={hasVoted || voting}
                  >
                    {hasVoted ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Ya votaste
                      </>
                    ) : (
                      <>
                        <Vote className="h-4 w-4 mr-2" />
                        Votar por esta propuesta
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
