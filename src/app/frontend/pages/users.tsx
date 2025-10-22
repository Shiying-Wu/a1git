import useSWR from 'swr';
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function UsersPage() {
  const { data, error } = useSWR('/api/users', fetcher);
  if (error) return <div>Error loading users</div>;
  if (!data) return <div>Loading...</div>;
  return (
    <ul>
      {data.map((user: any) => (
        <li key={user.id}>{user.name} - {user.email}</li>
      ))}
    </ul>
  );
}