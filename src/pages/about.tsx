import Head from 'next/head';

export default function About() {
  return (
    <>
      <Head>
        <title>About - Next.js React Starter</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
        <h1>About Us</h1>
        <p>This is a simple, reusable about page template.</p>
        <p>Replace this content with your own information.</p>
      </main>
    </>
  );
}
