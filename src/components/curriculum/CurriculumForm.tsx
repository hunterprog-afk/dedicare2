import { m } from "motion/react"
import { useCurriculumForm } from "@/hooks/useCurriculumForm"
import { CurriculumFormFields } from "@/components/curriculum/CurriculumFormFields"
import { CurriculumFormSuccess } from "@/components/curriculum/CurriculumFormSuccess"

/** Colonna destra di Curriculum: pannello form candidatura. */
export function CurriculumForm() {
  const { fields, cv, status, errorMsg, handleChange, handleFile, handleSubmit, resetToIdle } =
    useCurriculumForm()

  return (
    <m.form
      onSubmit={handleSubmit}
      noValidate
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      className="rounded-2xl bg-[hsl(222,35%,13%)]/95 border border-white/10 p-6 md:p-8 flex flex-col gap-5 shadow-xl shadow-black/10"
    >
      {status === "success" ? (
        <CurriculumFormSuccess onRetry={resetToIdle} />
      ) : (
        <CurriculumFormFields
          fields={fields}
          cv={cv}
          status={status}
          errorMsg={errorMsg}
          onChange={handleChange}
          onFile={handleFile}
        />
      )}
    </m.form>
  )
}
