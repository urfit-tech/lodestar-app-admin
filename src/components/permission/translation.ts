import { defineMessages } from 'react-intl'

const permissionMessages = {
  '*': defineMessages({
    cancel: { id: 'permission.*.cancel', defaultMessage: 'cancel' },
    editPermissionGroup: { id: 'permission.*.editPermissionGroup', defaultMessage: 'Edit permission group' },
    deletePermissionGroup: { id: 'permission.*.deletePermissionGroup', defaultMessage: 'Delete permission group' },
  }),
  PermissionGroupAdminItem: defineMessages({
    createPermissionGroup: {
      id: 'permission.PermissionGroupAdminItem.createPermissionGroup',
      defaultMessage: 'Add new permission group',
    },
  }),
  PermissionGroupAdminModal: defineMessages({
    permissionSettings: {
      id: 'permission.PermissionGroupAdminModal.permissionSettings',
      defaultMessage: 'permission settings',
    },
    isRequired: { id: 'permission.PermissionGroupAdminModal.isRequired', defaultMessage: 'Please enter {field}' },
    save: { id: 'permission.PermissionGroupAdminModal.save', defaultMessage: 'save' },
    name: { id: 'permission.PermissionGroupAdminModal.name', defaultMessage: 'name' },
    successfullyEdited: {
      id: 'permission.PermissionGroupAdminModal.successfullyEdited',
      defaultMessage: 'edit successfully',
    },
    successfullyCreated: {
      id: 'permission.PermissionGroupAdminModal.successfullyCreated',
      defaultMessage: 'create successfully',
    },
  }),
  PermissionGroupDeletionModal: defineMessages({
    delete: { id: 'permission.PermissionGroupDeletionModal.delete', defaultMessage: 'delete' },
    successfullyDeleted: {
      id: 'permission.PermissionGroupDeletionModal.successfullyDeleted',
      defaultMessage: 'delete successfully',
    },
    deletePermissionGroupConfirmation: {
      id: 'permission.deletePermissionGroupConfirmation.deletePermissionGroupConfirmation',
      defaultMessage:
        'Once a permission group is deleted, it cannot be restored, and members assigned to this group will lose their permissions. Are you sure you want to delete it?',
    },
  }),
}

export default permissionMessages
