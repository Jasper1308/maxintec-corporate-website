export default function RegisterPage() {
  return (
    <div className="container mx-auto px-6 py-20 min-h-screen max-w-xl">
      <h1 className="text-3xl font-extrabold tracking-tight">Resident Access Registration</h1>
      <p className="mt-2 text-slate-400 text-sm">
        Please complete the fields below to request facial recognition access for your residential complex. Your data will be processed and sent to management for validation.
      </p>
      
      {/* Aqui entrará o formulário integrado com o Supabase */}
      <div className="mt-8 p-6 bg-slate-900 border border-slate-800 rounded-xl text-center text-slate-500">
        Form placeholder - Next step: Supabase integration.
      </div>
    </div>
  );
}