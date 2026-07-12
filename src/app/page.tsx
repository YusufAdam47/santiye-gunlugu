import Nav from '@/components/Nav';
import NewEntryForm from '@/components/NewEntryForm';

export default function Home() {
  return (
    <main className="mx-auto max-w-md px-4 py-6">
      <h1 className="mb-4 text-lg font-medium text-neutral-900">Şantiye Günlüğü</h1>
      <Nav />
      <NewEntryForm />
    </main>
  );
}
