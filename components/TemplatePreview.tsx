import { Card, CardContent, CardHeader } from "./ui/card";

interface TemplatePreviewProps {
  title: string;
  content: string;
}

function TemplatePreview({ title, content }: TemplatePreviewProps) {
  return (
    <Card className="w-[200px] min-h-[200px] cursor-pointer hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-2 transition-all duration-300 group border-0 bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm overflow-hidden relative">
      <CardHeader className="pb-3 pt-6 px-6">
        <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors duration-300 text-lg leading-tight line-clamp-2">
          {title}
        </h3>
      </CardHeader>

      <CardContent className="px-6 pb-6  relative">
        <div className="text-gray-600 text-sm leading-relaxed h-full overflow-hidden relative">
          <p className="line-clamp-6">{content}</p>

          <div className="absolute inset-0 pointer-events-none"></div>
        </div>
      </CardContent>
    </Card>
  );
}

export default TemplatePreview;
