import Head from 'next/head';
import { useState } from 'react';
import { TextInput } from '@/components';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add your form submission logic here
    // Form data: formData
  };

  return (
    <>
      <Head>
        <title>Contact - Next.js React Starter</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
        <h1>Contact Us</h1>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
          <TextInput
            placeholder="Your Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <TextInput
            type="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <textarea
            placeholder="Your Message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            required
            rows={5}
            style={{ padding: '12px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </form>
      </main>
    </>
  );
}
