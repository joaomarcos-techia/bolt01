import React, { useState, useRef } from 'react'
import { 
  ArrowLeft, 
  User, 
  Camera, 
  Upload, 
  Save, 
  AlertCircle,
  CheckCircle,
  Home,
  Mail,
  Calendar,
  Trash2
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

interface ProfileSettingsProps {
  onBack: () => void
}

export function ProfileSettings({ onBack }: ProfileSettingsProps) {
  const { user, getUserDisplayName, getUserPhotoUrl } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    fullName: getUserDisplayName(),
    email: user?.email || ''
  })

  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(getUserPhotoUrl())

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'A foto deve ter no máximo 5MB' })
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Por favor, selecione uma imagem válida' })
        return
      }

      setProfilePhoto(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfilePhotoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      setMessage(null)
    }
  }

  const uploadProfilePhoto = async (file: File): Promise<string | null> => {
    try {
      if (!user) return null

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      // Use user ID as folder name for RLS policy
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Error uploading photo:', uploadError)
        throw new Error(`Erro no upload: ${uploadError.message}`)
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error('Error uploading profile photo:', error)
      throw error
    }
  }

  const handleRemovePhoto = () => {
    setProfilePhoto(null)
    setProfilePhotoPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      let photoUrl = profilePhotoPreview

      // Upload new photo if selected
      if (profilePhoto) {
        try {
          const uploadedUrl = await uploadProfilePhoto(profilePhoto)
          if (uploadedUrl) {
            photoUrl = uploadedUrl
          }
        } catch (uploadError) {
          throw new Error(`Falha ao fazer upload da foto: ${uploadError instanceof Error ? uploadError.message : 'Erro desconhecido'}`)
        }
      }

      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName.trim(),
          avatar_url: photoUrl || null
        }
      })

      if (error) {
        throw error
      }

      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' })
      setProfilePhoto(null)
      
      // Refresh the page after a short delay to show updated info
      setTimeout(() => {
        window.location.reload()
      }, 1500)

    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Erro ao atualizar perfil' 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBackToLanding = () => {
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-neumorphism border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="mr-4 text-gray-500 hover:text-gray-700 p-2 rounded-xl hover:shadow-neumorphism-inset transition-all duration-300"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-blue-400 to-blue-600 text-white p-2 rounded-xl mr-3 shadow-neumorphism">
                  <User size={20} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Configurações de Perfil</h1>
                  <p className="text-sm text-gray-600">Gerencie suas informações pessoais</p>
                </div>
              </div>
            </div>
            <button 
              onClick={handleBackToLanding}
              className="flex items-center text-gray-500 hover:text-gray-700 px-3 py-2 rounded-xl hover:shadow-neumorphism-inset transition-all duration-300"
              title="Voltar à página inicial"
            >
              <Home size={20} className="mr-2" />
              <span className="hidden sm:inline">Página Inicial</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Form */}
        <div className="bg-white rounded-2xl shadow-neumorphism p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Informações Pessoais</h2>

          {/* Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-xl border flex items-center ${
              message.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="mr-3" size={20} />
              ) : (
                <AlertCircle className="mr-3" size={20} />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Photo Section */}
            <div className="text-center">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Foto de Perfil
              </label>
              
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full bg-gray-100 border-4 border-white shadow-neumorphism flex items-center justify-center overflow-hidden">
                  {profilePhotoPreview ? (
                    <img 
                      src={profilePhotoPreview} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="text-gray-400" size={40} />
                  )}
                </div>
                
                <div className="absolute -bottom-2 -right-2 flex space-x-2">
                  <label className="bg-black text-white p-3 rounded-full cursor-pointer hover:bg-gray-800 transition-colors shadow-neumorphism hover:shadow-neumorphism-hover">
                    <Camera size={16} />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                  
                  {profilePhotoPreview && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="bg-red-600 text-white p-3 rounded-full hover:bg-red-700 transition-colors shadow-neumorphism hover:shadow-neumorphism-hover"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
              
              <p className="text-xs text-gray-500 mt-4">
                JPG, PNG ou GIF até 5MB
              </p>
            </div>

            {/* Form Fields */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-neumorphism-inset transition-all"
                    placeholder="Seu nome completo"
                    required
                  />
                </div>
              </div>

              {/* Email (readonly) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    value={formData.email}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500 shadow-neumorphism-inset cursor-not-allowed"
                    placeholder="seu@email.com"
                    disabled
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  O email não pode ser alterado
                </p>
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-gray-50 rounded-xl p-6 shadow-neumorphism-inset">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações da Conta</h3>
              
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <Calendar className="text-gray-500 mr-3" size={16} />
                  <div>
                    <span className="text-gray-600">Membro desde:</span>
                    <p className="font-medium text-gray-900">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <User className="text-gray-500 mr-3" size={16} />
                  <div>
                    <span className="text-gray-600">ID do usuário:</span>
                    <p className="font-medium text-gray-900 font-mono text-xs">
                      {user?.id?.slice(0, 8)}...
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-neumorphism hover:shadow-neumorphism-hover flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    Salvar Alterações
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Security Note */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center">
            <AlertCircle className="text-blue-500 mr-3" size={20} />
            <div>
              <p className="text-blue-800 font-medium">Segurança</p>
              <p className="text-blue-600 text-sm">
                Suas informações são protegidas e criptografadas. Para alterar sua senha, 
                use a opção "Esqueci minha senha" na tela de login.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}