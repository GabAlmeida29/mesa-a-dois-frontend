import { USERS } from '@/constants/texts';
import type { ManagedUser } from '@/lib/types';

export type UserAction =
  | { kind: 'create' }
  | { kind: 'edit'; user: ManagedUser }
  | { kind: 'password'; user: ManagedUser }
  | { kind: 'reset-2fa'; user: ManagedUser }
  | { kind: 'remove'; user: ManagedUser };

export function actionTitle(action: UserAction) {
  switch (action.kind) {
    case 'create':
      return USERS.createTitle;
    case 'edit':
      return USERS.editTitle(action.user.name);
    case 'password':
      return USERS.passwordTitle(action.user.name);
    case 'reset-2fa':
      return USERS.resetTwoFactorTitle(action.user.name);
    case 'remove':
      return USERS.removeTitle(action.user.name);
  }
}

export function actionDescription(action: UserAction) {
  switch (action.kind) {
    case 'create':
      return USERS.createHint;
    case 'password':
      return USERS.passwordHint;
    case 'reset-2fa':
      return USERS.resetTwoFactorText;
    case 'remove':
      return USERS.removeText;
    case 'edit':
      return null;
  }
}

export function actionSubmitLabel(action: UserAction) {
  if (action.kind === 'remove') return USERS.remove;
  if (action.kind === 'reset-2fa') return USERS.resetTwoFactor;
  return USERS.save;
}

export const isDangerous = (action: UserAction) => action.kind === 'remove' || action.kind === 'reset-2fa';
