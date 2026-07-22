import { TemplatesPage } from "@/features/conexoes/components/TemplatesPage";
import { Can } from "@/features/auth";

export function ConexoesTemplatesPage() {
  return (
    <Can permission="connections.manage">
      <TemplatesPage />
    </Can>
  );
}
