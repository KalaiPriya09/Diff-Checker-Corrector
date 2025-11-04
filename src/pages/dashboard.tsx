import Head from 'next/head';
import { Spinner } from '@/components';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  return (
    <>
      <Head>
        <title>Dashboard - Next.js React Starter</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1>Dashboard</h1>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <Spinner />
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginTop: '24px'
          }}>
            <div style={{
              padding: '24px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              backgroundColor: '#f9f9f9'
            }}>
              <h3>Total Users</h3>
              <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '16px 0' }}>1,234</p>
            </div>

            <div style={{
              padding: '24px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              backgroundColor: '#f9f9f9'
            }}>
              <h3>Revenue</h3>
              <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '16px 0' }}>$45,678</p>
            </div>

            <div style={{
              padding: '24px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              backgroundColor: '#f9f9f9'
            }}>
              <h3>Active Sessions</h3>
              <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '16px 0' }}>567</p>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
