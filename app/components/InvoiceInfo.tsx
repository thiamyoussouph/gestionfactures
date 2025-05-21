"use client";

import { Invoice } from '@/type';
import React, { useEffect } from 'react';

interface Props {
  invoice: Invoice;
  setInvoice: (invoice: Invoice) => void;
}

const InvoiceInfo: React.FC<Props> = ({ invoice, setInvoice }) => {
  useEffect(() => {
    if (invoice?.shop) {
      const updates: Partial<Invoice> = {};

      if (!invoice.issuerName) updates.issuerName = invoice.shop.name;
      if (!invoice.issuerAddress) updates.issuerAddress = invoice.shop.address;

      if (Object.keys(updates).length > 0) {
        setInvoice({ ...invoice, ...updates });
      }
    }
  }, [invoice, setInvoice]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof Invoice
  ) => {
    setInvoice({ ...invoice, [field]: e.target.value });
  };

  return (
    <div className='flex flex-col h-fit bg-base-200 p-5 rounded-xl mb-4 md:mb-0'>
      <div className='space-y-4'>
        {/* Émetteur */}
        <div className="space-y-2">
          <h2 className='badge badge-accent'>Émetteur</h2>

          <input
            type="text"
            value={invoice?.issuerName || ''}
            placeholder="Nom de l’entreprise émettrice"
            className='input input-bordered w-full'
            required
            onChange={(e) => handleInputChange(e, 'issuerName')}
          />

          <textarea
            value={invoice?.issuerAddress || ''}
            placeholder="Adresse de l’entreprise émettrice"
            className='textarea textarea-bordered w-full h-32'
            required
            onChange={(e) => handleInputChange(e, 'issuerAddress')}
          />

          {invoice?.shop && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input
                type="text"
                value={invoice.shop.phone}
                className="input input-bordered w-full"
                readOnly
              />
              <input
                type="text"
                value={invoice.shop.ninea}
                className="input input-bordered w-full"
                readOnly
              />
            </div>
          )}
        </div>

        {/* Client */}
        <div className="space-y-2">
          <h2 className='badge badge-accent'>Client</h2>
          <input
            type="text"
            value={invoice?.clientName || ''}
            placeholder="Nom du client"
            className='input input-bordered w-full'
            required
            onChange={(e) => handleInputChange(e, 'clientName')}
          />

          <textarea
            value={invoice?.clientAddress || ''}
            placeholder="Adresse du client"
            className='textarea textarea-bordered w-full h-32'
            required
            onChange={(e) => handleInputChange(e, 'clientAddress')}
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h2 className='badge badge-accent'>Date de la Facture</h2>
            <input
              type="date"
              value={invoice?.invoiceDate || ''}
              className='input input-bordered w-full'
              required
              onChange={(e) => handleInputChange(e, 'invoiceDate')}
            />
          </div>

          <div className="space-y-2">
            <h2 className='badge badge-accent'>Date d’échéance</h2>
            <input
              type="date"
              value={invoice?.dueDate || ''}
              className='input input-bordered w-full'
              required
              onChange={(e) => handleInputChange(e, 'dueDate')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceInfo;
