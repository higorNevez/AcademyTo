import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare } from "lucide-react"

async function getMessages(userId: string) {
  return prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId },
        { receiverId: userId }
      ]
    },
    include: {
      sender: true,
      receiver: true
    },
    orderBy: { createdAt: "desc" }
  })
}

export default async function MensagensPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return <div>Erro ao carregar mensagens</div>
  }

  const messages = await getMessages(session.user.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Mensagens</h1>
        <p className="text-[#a1a1aa]">Comunicação com seu personal trainer</p>
      </div>

      {messages.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 text-[#a1a1aa] mx-auto mb-4" />
            <p className="text-[#a1a1aa]">Nenhuma mensagem ainda</p>
            <p className="text-xs text-[#a1a1aa] mt-2">Seu personal trainer em breve entrará em contato</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {messages.map((message) => {
            const isMe = message.senderId === session.user.id
            return (
              <Card key={message.id} className={isMe ? "bg-[#7c3aed]/10" : "bg-[#2a2a2a]"}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${
                      isMe ? "bg-[#7c3aed]" : "bg-[#4b5320]"
                    }`}>
                      {(isMe ? message.sender : message.receiver).name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">
                        {isMe ? "Você" : message.sender.name}
                      </p>
                      <p className="text-sm text-[#a1a1aa] break-words mt-1">{message.content}</p>
                      {message.mediaUrl && (
                        <div className="mt-2">
                          {message.mediaType?.startsWith("image/") ? (
                            <img
                              src={message.mediaUrl}
                              alt="Media"
                              className="max-w-xs max-h-48 rounded-lg"
                            />
                          ) : message.mediaType?.startsWith("video/") ? (
                            <video
                              src={message.mediaUrl}
                              controls
                              className="max-w-xs max-h-48 rounded-lg"
                            />
                          ) : null}
                        </div>
                      )}
                      <p className="text-xs text-[#a1a1aa] mt-2">
                        {new Date(message.createdAt).toLocaleDateString('pt-BR')} às{' '}
                        {new Date(message.createdAt).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Card className="bg-blue-500/10 border-blue-500/30">
        <CardContent className="p-4">
          <p className="text-xs text-blue-500 font-medium">Nota</p>
          <p className="text-sm text-[#a1a1aa] mt-1">
            A funcionalidade de envio de mensagens será habilitada em breve. Por enquanto, apenas visualize as mensagens recebidas.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
