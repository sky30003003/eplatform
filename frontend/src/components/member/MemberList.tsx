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
  Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import { User, getUserStatusInfo } from '../../types/user';

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

  return (
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
  );
}; 