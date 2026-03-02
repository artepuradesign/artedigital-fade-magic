import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, ListChecks, CreditCard, Search, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const steps = [
  {
    icon: UserPlus,
    title: 'Crie sua conta',
    desc: 'Cadastro em menos de 1 minuto com e-mail e senha',
    illustration: '👤',
  },
  {
    icon: ListChecks,
    title: 'Escolha seu plano',
    desc: 'Selecione o plano ideal para suas necessidades',
    illustration: '📋',
  },
  {
    icon: CreditCard,
    title: 'Pague ou recarregue',
    desc: 'Assine um plano ou recarregue saldo para economizar',
    illustration: '💳',
  },
  {
    icon: Search,
    title: 'Faça suas consultas',
    desc: 'Acesse informações completas em segundos',
    illustration: '🔍',
  },
];

const CleanHowItWorksSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-10 sm:py-16 lg:py-24 relative overflow-hidden bg-card border-y border-border/40">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-8 sm:mb-14"
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-2">
            Passo a passo
          </span>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2">Como funciona</h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">4 passos simples para começar a consultar</p>
        </motion.div>

        <div className="relative">
          {/* Connection line - desktop */}
          <div className="hidden lg:block absolute top-24 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 z-0" />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.12 }}
                className="relative flex flex-col items-center text-center"
              >
                {/* Step number badge */}
                <div className="relative z-10 mb-3 sm:mb-4">
                  <div className="h-14 w-14 sm:h-20 sm:w-20 rounded-xl sm:rounded-2xl bg-card border-2 border-primary/20 shadow-lg flex items-center justify-center text-2xl sm:text-4xl">
                    <span>{step.illustration}</span>
                  </div>
                  <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 h-5 w-5 sm:h-7 sm:w-7 rounded-full bg-primary text-primary-foreground text-[10px] sm:text-xs font-bold flex items-center justify-center shadow-md">
                    {i + 1}
                  </span>
                </div>

                <h3 className="font-semibold text-foreground text-sm sm:text-lg mb-1 sm:mb-2">{step.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-[160px] sm:max-w-[200px]">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="text-center mt-12"
        >
          <Button
            size="lg"
            className="font-semibold px-8 shadow-lg hover:shadow-xl transition-shadow"
            onClick={() => navigate('/registration')}
          >
            Comece em 1 minuto
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default CleanHowItWorksSection;
