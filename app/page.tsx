export default function Home() {
  return (
    <div>
      <h1>Env Check</h1>
      <p>VERCEL_URL: {process.env.VERCEL_URL}</p>
      <p>NODE_ENV: {process.env.NODE_ENV}</p>
    </div>
  );
}
