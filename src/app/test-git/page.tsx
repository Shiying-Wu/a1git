import GitCommandGenerator from '../Components/GitCommandGenerator';

export default function TestGitPage() {
  return (
    <div style={{ padding: '20px', minHeight: '100vh', background: 'var(--background)' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--foreground)' }}>
        Git Command Executor Test
      </h1>
      <GitCommandGenerator />
    </div>
  );
}



