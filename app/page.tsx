import Link from "next/link";
import { ClipboardList, Stethoscope } from "lucide-react";
import { WolffLogo } from "@/components/wolff-logo";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="flex w-full max-w-md flex-col items-center gap-10">
        <WolffLogo priority width={200} height={145} className="w-44 sm:w-52" />

        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-pretty text-2xl font-semibold text-foreground">
            Bienvenido
          </h1>
          <p className="text-balance text-base leading-relaxed text-muted-foreground">
            Centro cardiológico y de medicina deportiva.
          </p>
        </div>

        <div className="flex w-full flex-col gap-4">
          <Link href="/formulario" className="group">
            <Card className="transition-colors hover:border-primary">
              <CardContent className="flex items-center gap-4 py-5">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ClipboardList className="size-6" aria-hidden="true" />
                </span>
                <span className="flex flex-col">
                  <span className="text-lg font-medium text-foreground">
                    Formulario del paciente
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Completá tus datos antes de la consulta
                  </span>
                </span>
              </CardContent>
            </Card>
          </Link>

          <Link href="/panel" className="group">
            <Card className="transition-colors hover:border-primary">
              <CardContent className="flex items-center gap-4 py-5">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Stethoscope className="size-6" aria-hidden="true" />
                </span>
                <span className="flex flex-col">
                  <span className="text-lg font-medium text-foreground">
                    Panel médico
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Acceso protegido para profesionales
                  </span>
                </span>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </main>
  );
}
