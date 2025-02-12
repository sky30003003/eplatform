import { useState } from 'react';
import {
  Box,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Chip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LockResetIcon from '@mui/icons-material/LockReset';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { User, getUserStatusInfo } from '../../types/user';
import { memberService } from '../../services/memberService';

interface MemberListProps {
  members: User[];
  onEdit: (member: User) => void;
  onDelete: (member: User) => void;
}

export const MemberList = ({ 
  members,
  onEdit,
  onDelete,
}: MemberListProps) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const handleResetPassword = async (member: User) => {
    try {
      const result = await memberService.resetPassword(member.id);
      setTempPassword(result);
      setSelectedMember(member);
      setIsResetDialogOpen(true);
    } catch (error: any) {
      enqueueSnackbar(error.message, { variant: 'error' });
    }
  };

  const handleCloseResetDialog = () => {
    setIsResetDialogOpen(false);
    setTempPassword(null);
    setSelectedMember(null);
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width="25%">
                <Typography fontWeight="bold">
                  {t('members.table.name')}
                </Typography>
              </TableCell>
              <TableCell width="25%">
                <Typography fontWeight="bold">
                  {t('members.table.email')}
                </Typography>
              </TableCell>
              <TableCell width="15%">
                <Typography fontWeight="bold">
                  {t('members.table.phone')}
                </Typography>
              </TableCell>
              <TableCell width="15%">
                <Typography fontWeight="bold">
                  {t('members.table.type')}
                </Typography>
              </TableCell>
              <TableCell width="10%" align="center">
                <Typography fontWeight="bold">
                  {t('members.table.status')}
                </Typography>
              </TableCell>
              <TableCell width="10%" align="center">
                <Typography fontWeight="bold">
                  {t('common.actions')}
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {members.map((member) => {
              const statusInfo = getUserStatusInfo(member);
              return (
                <TableRow key={member.id}>
                  <TableCell>{`${member.firstName} ${member.lastName}`}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>{member.phone}</TableCell>
                  <TableCell>{t(`members.types.${member.userType.toLowerCase()}`)}</TableCell>
                  <TableCell align="center">
                    <Tooltip title={statusInfo.tooltip.join('\n')}>
                      <Chip
                        label={t(`members.status.${member.status.toLowerCase()}`)}
                        color={statusInfo.color}
                        size="small"
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      <Tooltip title={t('common.edit')}>
                        <IconButton
                          size="small"
                          onClick={() => onEdit(member)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('members.actions.resetPassword')}>
                        <IconButton
                          size="small"
                          onClick={() => handleResetPassword(member)}
                          color="primary"
                        >
                          <LockResetIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('common.delete')}>
                        <IconButton
                          size="small"
                          onClick={() => onDelete(member)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={isResetDialogOpen} 
        onClose={handleCloseResetDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('members.resetPassword.title')}</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {t('members.resetPassword.success', { 
                name: selectedMember ? `${selectedMember.firstName} ${selectedMember.lastName}` : '' 
              })}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {t('members.resetPassword.tempPassword')}
            </Typography>
            <Typography
              variant="h5"
              sx={{
                p: 2,
                bgcolor: 'background.paper',
                borderRadius: 1,
                fontFamily: 'monospace',
                wordBreak: 'break-all'
              }}
            >
              {tempPassword}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {t('members.resetPassword.note')}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResetDialog}>
            {t('common.close')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}; 