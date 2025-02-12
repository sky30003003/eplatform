import { User } from '../../types/user';
import { BaseDialog } from '../common/BaseDialog';
import { MemberForm } from './MemberForm';
import { memberService } from '../../services/memberService';

interface MemberDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  member?: User;
}

export function MemberDialog({
  open,
  onClose,
  onSuccess,
  member,
}: MemberDialogProps) {
  const handleSubmit = async (values: User) => {
    try {
      if (member) {
        await memberService.updateMember(member.id, values);
      } else {
        await memberService.createMember(values);
      }
      onSuccess();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      onSuccess={onSuccess}
    >
      <MemberForm
        member={member}
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </BaseDialog>
  );
} 