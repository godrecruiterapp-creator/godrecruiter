import { z } from 'zod'

export const inviteUserSchema = z.object({
  email: z.string().email(),
  full_name: z.string().min(2).max(100),
  role: z.enum([
    'admin',
    'senior_recruiter',
    'recruiter',
    'sourcer',
    'interviewer',
    'client_portal',
  ]),
})

export const updateUserRoleSchema = z.object({
  role: z.enum([
    'admin',
    'senior_recruiter',
    'recruiter',
    'sourcer',
    'interviewer',
    'client_portal',
  ]),
})

export type InviteUserInput = z.infer<typeof inviteUserSchema>
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>
