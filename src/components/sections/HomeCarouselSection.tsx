import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileSearch, ShieldCheck, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSiteTheme } from "@/contexts/SiteThemeContext";

import slide01 from "@/assets/home-carousel-01.jpg";
import slide02 from "@/assets/home-carousel-02.jpg";
import slide03 from "@/assets/home-carousel-03.jpg";
import slide04 from "@/assets/home-carousel-04.jpg";

type Slide = {
  title: string;
  subtitle: string;
  image: string;
};

type Benefit = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

const HomeCarouselSection: React.FC = () => {
  const navigate = useNavigate();
  const { currentVisualTheme } = useSiteTheme();
  const isMatrix = currentVisualTheme === 'matrix';
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [active, setActive] = useState(0);

  const slides = useMemo<Slide[]>(
    () => [
      {
        title: "Soluções digitais.",
        subtitle: "Acesse dados confiáveis em tempo real para impulsionar seu negócio.",
        image: slide02,
      },
      {
        title: "Ferramentas para Empresas",
        subtitle: "Plataforma completa com módulos de consulta e gestão empresarial.",
        image: slide01,
      },
      {
        title: "Ideal para empresas!",
        subtitle: "Planos flexíveis que acompanham o crescimento da sua empresa.",
        image: slide03,
      },
      {
        title: "Tecnologia em decisões",
        subtitle: "Inteligência de dados com segurança e conformidade LGPD.",
        image: slide04,
      },
    ],
    []
  );

  const benefits = useMemo<Benefit[]>(
    () => [
      {
        icon: <Zap className="h-4 w-4 text-primary" aria-hidden="true" />,
        title: "Rápido",
        description: "Respostas instantâneas",
      },
      {
        icon: <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />,
        title: "Seguro",
        description: "LGPD + criptografia",
      },
      {
        icon: <FileSearch className="h-4 w-4 text-primary" aria-hidden="true" />,
        title: "Completo",
        description: "Consultas + módulos empresariais",
      },
    ],
    []
  );

  React.useEffect(() => {
    if (!api) return;
    const onSelect = () => setActive(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => { api.off("select", onSelect); };
  }, [api]);

  return (
    <section aria-label="Destaques" className="w-full">
      <div className="relative w-full overflow-hidden">
        <Carousel
          setApi={setApi}
          opts={{ loop: true }}
          plugins={[
            Autoplay({
              delay: 6500,
              stopOnInteraction: true,
              stopOnMouseEnter: true,
            }),
          ]}
          className="w-full"
        >
          <CarouselContent className="ml-0">
            {slides.map((slide, idx) => (
              <CarouselItem key={idx} className="pl-0">
                <div className="relative w-full">
                  <div className="relative">
                    {/* Image: hidden in matrix theme */}
                    {!isMatrix && (
                      <img
                        src={slide.image}
                        alt={slide.title}
                        loading={idx === 0 ? "eager" : "lazy"}
                        className={cn(
                          "w-full object-cover",
                          "h-[420px] sm:h-[380px] lg:h-[460px]",
                          "select-none"
                        )}
                      />
                    )}

                    {/* Spacer when no image (matrix) */}
                    {isMatrix && (
                      <div className="w-full h-[420px] sm:h-[380px] lg:h-[460px]" />
                    )}

                    {/* Gradients: hidden in matrix theme */}
                    {!isMatrix && (
                      <>
                        <div className="absolute inset-0 z-[1] hidden sm:block bg-gradient-to-r from-white/85 via-white/45 to-transparent dark:from-background/95 dark:via-background/60 dark:to-transparent" />
                        <div className="absolute inset-0 z-[1] sm:hidden bg-gradient-to-r from-background/85 via-background/40 to-transparent" />
                      </>
                    )}
                  </div>

                  {/* Text content */}
                  <div className="absolute inset-0 z-[2] pointer-events-none">
                    <div className="container mx-auto px-4 sm:px-6 max-w-6xl h-full pointer-events-auto">
                      <div className={cn(
                        "h-full flex py-10 sm:py-12",
                        isMatrix
                          ? "items-center justify-center"
                          : "items-end sm:items-center pb-16 sm:pb-0"
                      )}>
                        <div className={cn(
                          "w-full",
                          isMatrix
                            ? "max-w-2xl text-center"
                            : "sm:max-w-xl text-center sm:text-left"
                        )}>
                          <div className={cn(
                            "mx-auto max-w-[520px]",
                            isMatrix
                              ? "sm:max-w-2xl"
                              : "sm:mx-0 rounded-xl bg-background/55 backdrop-blur-md ring-1 ring-border/60 p-4 sm:p-0 sm:rounded-none sm:bg-transparent sm:backdrop-blur-0 sm:ring-0"
                          )}>
                            <motion.p
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.35 }}
                              className="text-xs sm:text-sm font-medium text-muted-foreground"
                            >
                              Plataforma de consultas
                            </motion.p>

                            <AnimatePresence mode="wait">
                              <motion.h1
                                key={`title-${active}`}
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.35 }}
                                className="mt-2 text-[22px] leading-tight sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground"
                              >
                                {slide.title}
                              </motion.h1>
                            </AnimatePresence>

                            <AnimatePresence mode="wait">
                              <motion.p
                                key={`subtitle-${active}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.35, delay: 0.05 }}
                                className={cn(
                                  "mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-[42ch] mx-auto",
                                  isMatrix ? "" : "sm:mx-0 hidden sm:block"
                                )}
                              >
                                {slide.subtitle}
                              </motion.p>
                            </AnimatePresence>

                            <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row flex-wrap gap-2 justify-center">
                              <Button
                                size="sm"
                                className={cn("w-full sm:w-auto", isMatrix ? "" : "hidden sm:inline-flex")}
                                onClick={() => navigate("/registration")}
                              >
                                Testar grátis (10 consultas)
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full sm:w-auto"
                                onClick={() => navigate("/planos-publicos")}
                              >
                                Ver planos
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Arrows */}
          <CarouselPrevious
            className="hidden sm:flex left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/70 hover:bg-background/85 border-border/60"
            variant="outline"
          />
          <CarouselNext
            className="hidden sm:flex right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/70 hover:bg-background/85 border-border/60"
            variant="outline"
          />

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Ir para slide ${i + 1}`}
                onClick={() => api?.scrollTo(i)}
                className={cn(
                  "h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full transition-all",
                  i === active
                    ? "bg-primary"
                    : "bg-muted-foreground/40 hover:bg-muted-foreground/60"
                )}
              />
            ))}
          </div>
        </Carousel>
      </div>
    </section>
  );
};

export default HomeCarouselSection;
