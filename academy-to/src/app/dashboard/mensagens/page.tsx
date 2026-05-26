"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Send, Paperclip, Search, Loader2 } from "lucide-react"

interface Message {
  id: string
  senderId: string
  sender: { id: string; name: string; email: string }
  receiverId: string
  receiver: { id: string; name: string; email: string }
  content: string
  mediaUrl?: string
  mediaType?: string
  readAt?: Date
  createdAt: Date
}

interface Conversation {
  studentId: string
  studentName: string
  studentEmail: string
  lastMessage?: Message
  unreadCount: number
}

export default function MensagensPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [messageText, setMessageText] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    if (selectedStudentId) {
      fetchMessages(selectedStudentId)
    }
  }, [selectedStudentId])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/messages/conversations")
      const data = await response.json()
      setConversations(data)
    } catch (error) {
      console.error("Erro ao carregar conversas:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (studentId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/messages?studentId=${studentId}`)
      const data = await response.json()
      setMessages(data)
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim() || !selectedStudentId) return

    setSendingMessage(true)
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudentId,
          content: messageText,
        }),
      })

      if (response.ok) {
        setMessageText("")
        fetchMessages(selectedStudentId)
        fetchConversations()
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error)
    } finally {
      setSendingMessage(false)
    }
  }

  const filteredConversations = conversations.filter((c) =>
    c.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.studentEmail.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Mensagens</h1>
        <p className="text-[#a1a1aa]">Comunique-se com seus alunos</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px]">
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Conversas</CardTitle>
          </CardHeader>
          <div className="px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a1a1aa]" />
              <Input
                placeholder="Buscar aluno..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <CardContent className="flex-1 overflow-y-auto space-y-2">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-8 w-8 text-[#a1a1aa] mx-auto mb-2" />
                <p className="text-sm text-[#a1a1aa]">Nenhuma conversa</p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.studentId}
                  onClick={() => setSelectedStudentId(conv.studentId)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    selectedStudentId === conv.studentId
                      ? "bg-[#7c3aed] text-white"
                      : "bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{conv.studentName}</p>
                      <p className="text-xs text-[#a1a1aa] truncate">
                        {conv.lastMessage?.content || "Sem mensagens"}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <Badge className="ml-2">{conv.unreadCount}</Badge>
                    )}
                  </div>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col lg:col-span-2">
          {selectedStudentId ? (
            <>
              <CardHeader className="border-b border-[#3a3a3a]">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {conversations.find((c) => c.studentId === selectedStudentId)?.studentName}
                    </CardTitle>
                    <p className="text-sm text-[#a1a1aa]">
                      {conversations.find((c) => c.studentId === selectedStudentId)?.studentEmail}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto space-y-3 py-4">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-[#7c3aed]" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-[#a1a1aa]">Nenhuma mensagem ainda</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === selectedStudentId ? "justify-start" : "justify-end"
                      }`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          message.senderId === selectedStudentId
                            ? "bg-[#2a2a2a] text-white"
                            : "bg-[#7c3aed] text-white"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {new Date(message.createdAt).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
              <div className="border-t border-[#3a3a3a] p-4">
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <Button size="icon" variant="outline" type="button">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Textarea
                    placeholder="Digite sua mensagem..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="resize-none h-12"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage(e as any)
                      }
                    }}
                  />
                  <Button
                    type="submit"
                    disabled={sendingMessage || !messageText.trim()}
                    className="bg-[#4b5320] hover:bg-[#3d4419]"
                  >
                    {sendingMessage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-[#a1a1aa] mx-auto mb-4" />
                <p className="text-[#a1a1aa]">Selecione uma conversa para começar</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}

