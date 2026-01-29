import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

export const registerPersonalSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string(),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
})

export const registerStudentSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  inviteCode: z.string().min(1, 'Código de convite é obrigatório'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
})

export const anamnesisSchema = z.object({
  objectives: z.string().optional(),
  healthConditions: z.string().optional(),
  injuries: z.string().optional(),
  medications: z.string().optional(),
  activityLevel: z.string().optional(),
  sleepQuality: z.string().optional(),
  nutrition: z.string().optional(),
  observations: z.string().optional(),
})

export const exerciseSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  muscleGroup: z.string().min(1, 'Grupo muscular é obrigatório'),
  description: z.string().optional(),
  videoUrl: z.string().url().optional().or(z.literal('')),
  imageUrl: z.string().url().optional().or(z.literal('')),
})

export const workoutSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  type: z.string().min(1, 'Tipo é obrigatório'),
  muscleGroups: z.array(z.string()),
})

export const workoutExerciseSchema = z.object({
  exerciseId: z.string().min(1, 'Exercício é obrigatório'),
  sets: z.number().min(1, 'Mínimo 1 série'),
  reps: z.string().min(1, 'Repetições são obrigatórias'),
  restSeconds: z.number().optional(),
  notes: z.string().optional(),
  order: z.number(),
})

export const planSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  durationMonths: z.number().min(1, 'Duração mínima de 1 mês'),
  price: z.number().min(0, 'Preço não pode ser negativo'),
})

export const measurementSchema = z.object({
  weight: z.number().optional(),
  bodyFat: z.number().optional(),
  chest: z.number().optional(),
  waist: z.number().optional(),
  hips: z.number().optional(),
  leftArm: z.number().optional(),
  rightArm: z.number().optional(),
  leftThigh: z.number().optional(),
  rightThigh: z.number().optional(),
  leftCalf: z.number().optional(),
  rightCalf: z.number().optional(),
})

export const messageSchema = z.object({
  receiverId: z.string().min(1, 'Destinatário é obrigatório'),
  content: z.string().min(1, 'Mensagem não pode estar vazia'),
  mediaUrl: z.string().optional(),
  mediaType: z.string().optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterPersonalInput = z.infer<typeof registerPersonalSchema>
export type RegisterStudentInput = z.infer<typeof registerStudentSchema>
export type AnamnesisInput = z.infer<typeof anamnesisSchema>
export type ExerciseInput = z.infer<typeof exerciseSchema>
export type WorkoutInput = z.infer<typeof workoutSchema>
export type WorkoutExerciseInput = z.infer<typeof workoutExerciseSchema>
export type PlanInput = z.infer<typeof planSchema>
export type MeasurementInput = z.infer<typeof measurementSchema>
export type MessageInput = z.infer<typeof messageSchema>
