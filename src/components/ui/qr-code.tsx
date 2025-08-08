import QRCode from 'react-qr-code';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface QRCodeComponentProps {
  url: string;
  title?: string;
  description?: string;
  size?: number;
}

export function QRCodeComponent({ url, title = "QR Code", description, size = 200 }: QRCodeComponentProps) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    toast.success('Link copiado para a área de transferência!');
  };

  const openLink = () => {
    window.open(url, '_blank');
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center p-4 bg-white rounded-lg">
          <QRCode
            value={url}
            size={size}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            viewBox={`0 0 ${size} ${size}`}
            fgColor="#000000"
            bgColor="#ffffff"
          />
        </div>
        
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground break-all bg-muted p-2 rounded">
            {url}
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={copyToClipboard}
              className="flex-1"
            >
              <Copy className="h-3 w-3 mr-1" />
              Copiar
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={openLink}
              className="flex-1"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Abrir
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}