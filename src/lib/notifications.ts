import { prisma } from '@/lib/prisma'

export async function createNotification({
  userId,
  title,
  message,
  type = 'INFO',
  problemId,
  link,
}: {
  userId: string
  title: string
  message: string
  type?: string
  problemId?: string
  link?: string
}) {
  return prisma.notification.create({
    data: { userId, title, message, type, problemId, link },
  })
}

export async function notifyRole(
  role: string,
  title: string,
  message: string,
  type = 'INFO',
  link?: string
) {
  const users = await prisma.user.findMany({ where: { role: role as any } })
  await Promise.all(
    users.map((u) =>
      createNotification({ userId: u.id, title, message, type, link })
    )
  )
}
