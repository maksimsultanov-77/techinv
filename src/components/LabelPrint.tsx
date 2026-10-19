import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { Equipment } from '../db/database';

interface LabelPrintProps {
  equipment: Equipment;
  onClose: () => void;
}

export function LabelPrint({ equipment, onClose }: LabelPrintProps) {
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, equipment.inventory_number, {
          format: 'CODE128',
          width: 1.2,
          height: 25,
          displayValue: false,
          margin: 0,
        });
      } catch (error) {
        console.error('Error generating barcode:', error);
      }
    }
  }, [equipment.inventory_number]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Печать этикетки</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {/* Preview */}
          <div className="mb-6 flex justify-center">
            <div className="label-preview border-2 border-dashed border-gray-300 p-2 bg-white">
              <div className="label-content">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-[8pt] text-gray-600">Инв. №</span>
                  <span className="text-[9pt] font-bold">{equipment.inventory_number}</span>
                </div>
                
                <div className="barcode-container mb-1">
                  <svg ref={barcodeRef}></svg>
                </div>
                
                <div className="text-[7pt] leading-tight mb-1 break-words max-h-[18px] overflow-hidden">
                  {equipment.name}
                </div>
                
                {equipment.serial_number && (
                  <div className="text-[7pt] leading-tight break-words">
                    S/N: {equipment.serial_number}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handlePrint}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              🖨️ Печать
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
