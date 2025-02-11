import { useState } from 'react';
import { Container, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Tooltip, Chip, Alert } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { PageHeader } from '../../components/common/PageHeader';
import { DeleteConfirmationDialog } from '../../components/common/DeleteConfirmationDialog';
import { memberService } from '../../services/memberService';
import { useAuth } from '../../contexts/AuthContext';
import { UserType, UserStatus } from '../../types/user';

export default function MembersPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: members, isLoading, error, refetch } = useQuery({
    queryKey: ['members', 'orgadmins'],
    queryFn: memberService.getOrgAdmins,
  });

  const handleDelete = async () => {
    if (!selectedMemberId) return;

    try {
      await memberService.deleteMember(selectedMemberId);
      enqueueSnackbar(t('members.messages.deleteSuccess'), { variant: 'success' });
      refetch();
    } catch (error: any) {
      enqueueSnackbar(error.message || t('members.errors.deleteError'), { variant: 'error' });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedMemberId(null);
    }
  };

  const openDeleteDialog = (memberId: string) => {
    setSelectedMemberId(memberId);
    setIsDeleteDialogOpen(true);
  };

  if (isLoading) {
    return <Alert severity="info">{t('common.loading')}</Alert>;
  }

  if (error) {
    return <Alert severity="error">{t('members.errors.fetchError')}</Alert>;
  }

  const filteredMembers = members?.filter(member => 
    user?.userType === UserType.SUPERADMIN || 
    (user?.organizationId === member.organizationId)
  );

  return (
    <Container>
      <PageHeader 
        title={t('menu.members')}
      />

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('members.table.name')}</TableCell>
                <TableCell>{t('members.table.email')}</TableCell>
                <TableCell>{t('members.table.phone')}</TableCell>
                <TableCell>{t('members.table.organization')}</TableCell>
                <TableCell>{t('members.table.status')}</TableCell>
                <TableCell align="right">{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!filteredMembers?.length ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    {t('members.messages.noMembers')}
                  </TableCell>
                </TableRow>
              ) : (
                filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      {member.firstName} {member.lastName}
                    </TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{member.phone}</TableCell>
                    <TableCell>{member.organization?.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={t(`members.status.${member.status.toLowerCase()}`)}
                        color={member.status === UserStatus.ACTIVE ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      {user?.userType === UserType.SUPERADMIN && (
                        <>
                          <Tooltip title={t('common.edit')}>
                            <IconButton
                              size="small"
                              onClick={() => {}} // TODO: Implementare editare
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t('common.delete')}>
                            <IconButton
                              size="small"
                              onClick={() => openDeleteDialog(member.id)}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title={t('members.deleteDialog.title')}
        content={t('members.deleteDialog.content')}
      />
    </Container>
  );
} 