import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-300">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mt-4">
          Page non trouvée
        </h2>
        <p className="text-gray-600 mt-2 mb-8">
          Désolé, la page que vous recherchez n&apos;existe pas.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <Button
            type="button"
            onClick={() => navigate('/dashboard')}
          >
            <Home className="h-4 w-4 mr-2" />
            Accueil
          </Button>
        </div>
      </div>
    </div>
  );
};
