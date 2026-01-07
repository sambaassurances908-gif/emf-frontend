import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Car, HeartHandshake, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface SelectionCardProps {
    title: string
    description: string
    icon: React.ElementType
    onClick: () => void
    color: string
    iconColor: string
}

const SelectionCard: React.FC<SelectionCardProps> = ({ title, description, icon: Icon, onClick, color, iconColor }) => (
    <div
        onClick={onClick}
        className={`group relative p-8 rounded-[2rem] bg-white border border-gray-100 shadow-soft hover:shadow-card-hover hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col items-center text-center`}
    >
        <div className={`absolute top-0 left-0 w-full h-2 ${color}`}></div>
        <div className={`w-20 h-20 rounded-3xl ${color.replace('bg-', 'bg-opacity-10 bg-')} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 animate-in fade-in zoom-in duration-500`}>
            <Icon size={40} className={iconColor} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">{description}</p>
        <Button
            className={`w-full rounded-2xl font-bold py-6 ${color} hover:brightness-95 text-white shadow-lg transition-all`}
        >
            Sélectionner
        </Button>
    </div>
)

export const EdgContractTypeSelector = () => {
    const navigate = useNavigate()

    const choices = [
        {
            title: "EDG Standard",
            description: "Assurance emprunteur classique pour les crédits et micro-crédits.",
            icon: ShieldCheck,
            color: "bg-teal-600",
            iconColor: "text-teal-600",
            path: "/contrats/nouveau/edg-standard"
        },
        {
            title: "EDG Taxi - Perte de Recette",
            description: "Garantie de revenus pour les chauffeurs de taxi en cas d'immobilisation.",
            icon: Car,
            color: "bg-orange-500",
            iconColor: "text-orange-500",
            path: "/contrats/nouveau/edg-taxi-perte-recette"
        },
        {
            title: "EDG Taxi - Prévoyance Décès",
            description: "Protection familiale et frais funéraires pour les transporteurs.",
            icon: HeartHandshake,
            color: "bg-purple-600",
            iconColor: "text-purple-600",
            path: "/contrats/nouveau/edg-taxi-prevoyance-deces"
        }
    ]

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col p-8 md:p-16">
            <div className="max-w-6xl mx-auto w-full">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/dashboard/edg')}
                    className="mb-8 hover:bg-white text-gray-500 flex items-center gap-2 group transition-all"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Retour au Dashboard
                </Button>

                <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
                        Quel type de contrat <span className="text-teal-600 underline decoration-teal-100 decoration-8 underline-offset-8">EDG</span> ?
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                        Choisissez le formulaire adapté aux besoins de votre client pour commencer la souscription.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {choices.map((choice, index) => (
                        <div key={index} className="animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${index * 150}ms` }}>
                            <SelectionCard
                                {...choice}
                                onClick={() => navigate(choice.path)}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-auto pt-16 text-center text-gray-400 text-sm italic">
                Samba Assurances &bull; Excellence en Micro-assurance
            </div>
        </div>
    )
}
