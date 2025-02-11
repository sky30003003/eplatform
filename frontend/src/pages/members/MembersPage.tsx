import { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { User } from '../../types/user';
import { memberService } from '../../services/memberService';
import { MemberList } from '../../components/member/MemberList';
import { MemberDialog } from '../../components/member/MemberDialog';
import { DeleteConfirmationDialog } from '../../components/common/DeleteConfirmationDialog';
import { PageHeader } from '../../components/common/PageHeader';

export default function MembersPage() {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [members, setMembers] = useState<User[]>([]);
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const loadMembers = async () => {
    try {
      const data = await memberService.getOrgAdmins();
      setMembers(data);
    } catch (error) {
      enqueueSnackbar(t('members.messages.error'), { variant: 'error' });
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleCreateClick = () => {
    setIsCreateDialogOpen(true);
  };

  const handleEditClick = (member: User) => {
    setSelectedMember(member);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (member: User) => {
    setSelectedMember(member);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedMember) return;

    try {
      await memberService.deleteMember(selectedMember.id);
      enqueueSnackbar(t('members.messages.deleteSuccess'), { variant: 'success' });
      loadMembers();
    } catch (error) {
      enqueueSnackbar(t('members.messages.error'), { variant: 'error' });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedMember(null);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        title={t('members.title')}
        buttonText={t('members.addNew')}
        onButtonClick={handleCreateClick}
      />

      <MemberList 
        members={members}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

      <MemberDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={() => {
          loadMembers();
          setIsCreateDialogOpen(false);
        }}
      />

      {selectedMember && (
        <>
          <MemberDialog
            open={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            onSuccess={() => {
              loadMembers();
              setIsEditDialogOpen(false);
              setSelectedMember(null);
            }}
            member={selectedMember}
          />

          <DeleteConfirmationDialog
            open={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
            onConfirm={handleDelete}
            title={t('members.messages.deleteConfirm')}
            content={t('members.messages.deleteWarning')}
          />
        </>
      )}
    </Box>
  );
} 