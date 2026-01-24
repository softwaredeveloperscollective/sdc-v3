import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useRef, useState } from "react";
import { api } from "@/utils/api";
import { 
  ArrowUpTrayIcon, 
  XMarkIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  PencilSquareIcon,
  QuestionMarkCircleIcon
} from "@heroicons/react/24/outline";
import Image from "next/image";

interface ImportTechStacksModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

interface ImportRecord {
  tempId: string;
  label: string;
  slug: string;
  imgUrl: string;
  status: 'pending' | 'valid' | 'invalid' | 'duplicate' | 'importing' | 'success' | 'error';
  errors: string[];
  warnings: string[];
  isEditing?: boolean;
}

export default function ImportTechStacksModal({
  isOpen,
  setIsOpen,
}: ImportTechStacksModalProps) {
  const cancelButtonRef = useRef(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [records, setRecords] = useState<ImportRecord[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ label: '', slug: '', imgUrl: '' });

  const utils = api.useContext();

  const { data: existingTechs } = api.techs.getAll.useQuery(
    undefined,
    { enabled: isOpen }
  );

  const { mutateAsync: createTech } = api.techs.create.useMutation();

  const generateSlug = (label: string): string => {
    return label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const validateRecord = (
    record: Omit<ImportRecord, 'tempId' | 'status' | 'errors' | 'warnings'>
  ): { 
    valid: boolean; 
    errors: string[]; 
    warnings: string[];
    isDuplicate: boolean;
  } => {
    const errors: string[] = [];
    const warnings: string[] = [];
    let isDuplicate = false;

    if (!record.label.trim()) {
      errors.push("Label is required");
    }

    if (!record.imgUrl.trim()) {
      errors.push("Image URL is required");
    } else {
      const trimmedUrl = record.imgUrl.trim();
      
      const hasProtocol = /^https?:\/\//i.test(trimmedUrl);
      
      if (!hasProtocol) {
        // Check if it looks like a domain (has a dot and no spaces)
        const looksLikeDomain = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+/i.test(trimmedUrl);
        
        if (!looksLikeDomain) {
          errors.push("Invalid URL format - must be a valid URL or domain");
        } else {
          try {
            new URL(`https://${trimmedUrl}`);
          } catch {
            errors.push("Invalid URL format");
          }
        }
      } else {
        try {
          const url = new URL(trimmedUrl);
          if (!['http:', 'https:'].includes(url.protocol)) {
            errors.push("URL must use http or https protocol");
          }
        } catch {
          errors.push("Invalid URL format");
        }
      }
    }

    if (existingTechs && record.label.trim()) {
      const slug = record.slug.trim() || generateSlug(record.label.trim());
      
      const slugMatch = existingTechs.find(
        tech => tech.slug.toLowerCase() === slug.toLowerCase()
      );
      
      if (slugMatch) {
        isDuplicate = true;
        errors.push(`Tech stack with slug "${slug}" already exists`);
      }

      const labelMatch = existingTechs.find(
        tech => tech.label.toLowerCase() === record.label.trim().toLowerCase()
      );
      
      if (labelMatch && !slugMatch) {
        warnings.push(`Similar tech stack exists: "${labelMatch.label}"`);
      }
    }

    const currentRecords = records.filter(r => r.tempId !== record.tempId);
    if (currentRecords.length > 0 && record.label.trim()) {
      const slug = record.slug.trim() || generateSlug(record.label.trim());
      const batchDuplicate = currentRecords.find(r => {
        const rSlug = r.slug.trim() || generateSlug(r.label.trim());
        return rSlug.toLowerCase() === slug.toLowerCase();
      });

      if (batchDuplicate) {
        isDuplicate = true;
        errors.push(`Duplicate in import batch`);
      }
    }

    return { 
      valid: errors.length === 0, 
      errors, 
      warnings,
      isDuplicate 
    };
  };

  const parseCSV = (text: string): ImportRecord[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0]?.split(',').map(h => h.trim().toLowerCase());
    
    if (!headers) return [];

    const labelIndex = headers.indexOf('label');
    const slugIndex = headers.indexOf('slug');
    const imgUrlIndex = headers.indexOf('imgurl') !== -1 ? headers.indexOf('imgurl') : headers.indexOf('img_url');

    if (labelIndex === -1 || imgUrlIndex === -1) {
      alert('CSV must contain "label" and "imgUrl" columns');
      return [];
    }

    const parsedRecords = lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const label = values[labelIndex] || '';
      const slug = slugIndex !== -1 ? values[slugIndex] || '' : '';
      const imgUrl = values[imgUrlIndex] || '';

      return {
        tempId: `temp-${Date.now()}-${index}`,
        label,
        slug,
        imgUrl,
        status: 'pending' as const,
        errors: [],
        warnings: [],
      };
    });

    return parsedRecords.map(record => {
      const validation = validateRecord(record);
      return {
        ...record,
        status: validation.isDuplicate 
          ? 'duplicate' 
          : validation.valid 
            ? 'valid' 
            : 'invalid',
        errors: validation.errors,
        warnings: validation.warnings,
      };
    });
  };

  const parseJSON = (text: string): ImportRecord[] => {
    try {
      const data = JSON.parse(text);
      const array = Array.isArray(data) ? data : [data];

      const parsedRecords = array.map((item, index) => {
        const label = item.label || item.name || '';
        const slug = item.slug || '';
        const imgUrl = item.imgUrl || item.img_url || item.imageUrl || '';

        return {
          tempId: `temp-${Date.now()}-${index}`,
          label,
          slug,
          imgUrl,
          status: 'pending' as const,
          errors: [],
          warnings: [],
        };
      });

      return parsedRecords.map(record => {
        const validation = validateRecord(record);
        return {
          ...record,
          status: validation.isDuplicate 
            ? 'duplicate' 
            : validation.valid 
              ? 'valid' 
              : 'invalid',
          errors: validation.errors,
          warnings: validation.warnings,
        };
      });
    } catch (error) {
      alert('Invalid JSON format');
      return [];
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      let parsedRecords: ImportRecord[] = [];

      if (file.name.endsWith('.csv')) {
        parsedRecords = parseCSV(text);
      } else if (file.name.endsWith('.json')) {
        parsedRecords = parseJSON(text);
      } else {
        alert('Please upload a CSV or JSON file');
        return;
      }

      setRecords(parsedRecords);
    };

    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEdit = (record: ImportRecord) => {
    setEditingId(record.tempId);
    setEditForm({
      label: record.label,
      slug: record.slug,
      imgUrl: record.imgUrl,
    });
  };

  const handleSaveEdit = (tempId: string) => {
    const validation = validateRecord(editForm);
    
    setRecords(prev => prev.map(r => 
      r.tempId === tempId 
        ? {
            ...r,
            ...editForm,
            status: validation.isDuplicate 
              ? 'duplicate' 
              : validation.valid 
                ? 'valid' 
                : 'invalid',
            errors: validation.errors,
            warnings: validation.warnings,
          }
        : r
    ));
    
    setEditingId(null);
  };

  const handleRemove = (tempId: string) => {
    setRecords(prev => {
      const newRecords = prev.filter(r => r.tempId !== tempId);
      return newRecords.map(record => {
        const validation = validateRecord(record);
        return {
          ...record,
          status: validation.isDuplicate 
            ? 'duplicate' 
            : validation.valid 
              ? 'valid' 
              : 'invalid',
          errors: validation.errors,
          warnings: validation.warnings,
        };
      });
    });
  };

  const handleImportAll = async () => {
    const validRecords = records.filter(r => r.status === 'valid');
    
    if (validRecords.length === 0) {
      alert('No valid records to import');
      return;
    }

    if (!confirm(`Import ${validRecords.length} tech stack(s)?`)) {
      return;
    }

    setIsImporting(true);

    for (const record of validRecords) {
      setRecords(prev => prev.map(r => 
        r.tempId === record.tempId ? { ...r, status: 'importing' } : r
      ));

      try {
        await createTech({
          label: record.label,
          slug: record.slug || undefined,
          imgUrl: record.imgUrl,
        });

        setRecords(prev => prev.map(r => 
          r.tempId === record.tempId ? { ...r, status: 'success', errors: [], warnings: [] } : r
        ));
      } catch (error) {
        setRecords(prev => prev.map(r => 
          r.tempId === record.tempId 
            ? { 
                ...r, 
                status: 'error', 
                errors: [error instanceof Error ? error.message : 'Import failed'] 
              } 
            : r
        ));
      }
    }

    setIsImporting(false);
    await utils.techs.getAll.invalidate();
  };

  const handleImportSingle = async (record: ImportRecord) => {
    if (record.status !== 'valid') return;

    setRecords(prev => prev.map(r => 
      r.tempId === record.tempId ? { ...r, status: 'importing' } : r
    ));

    try {
      await createTech({
        label: record.label,
        slug: record.slug || undefined,
        imgUrl: record.imgUrl,
      });

      setRecords(prev => prev.map(r => 
        r.tempId === record.tempId ? { ...r, status: 'success', errors: [], warnings: [] } : r
      ));

      await utils.techs.getAll.invalidate();
    } catch (error) {
      setRecords(prev => prev.map(r => 
        r.tempId === record.tempId 
          ? { 
              ...r, 
              status: 'error', 
              errors: [error instanceof Error ? error.message : 'Import failed'] 
            } 
          : r
      ));
    }
  };

  const handleClose = () => {
    if (isImporting) return;
    
    const hasSuccessful = records.some(r => r.status === 'success');
    const hasUnsaved = records.some(r => r.status === 'valid' || r.status === 'invalid' || r.status === 'duplicate');
    
    if (hasUnsaved && !hasSuccessful && !confirm('Close without importing? Unsaved changes will be lost.')) {
      return;
    }
    
    setRecords([]);
    setEditingId(null);
    
    setIsOpen(false);
  };

  const handleRefreshValidation = () => {
    setRecords(prev => prev.map(record => {
      const validation = validateRecord(record);
      return {
        ...record,
        status: validation.isDuplicate 
          ? 'duplicate' 
          : validation.valid 
            ? 'valid' 
            : 'invalid',
        errors: validation.errors,
        warnings: validation.warnings,
      };
    }));
  };

  const validCount = records.filter(r => r.status === 'valid').length;
  const invalidCount = records.filter(r => r.status === 'invalid').length;
  const duplicateCount = records.filter(r => r.status === 'duplicate').length;
  const successCount = records.filter(r => r.status === 'success').length;
  const errorCount = records.filter(r => r.status === 'error').length;
  const warningCount = records.filter(r => r.warnings.length > 0 && r.status === 'valid').length;

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={handleClose}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-6xl sm:p-6">
                <div>
                  <div className="text-center border-b pb-4">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      Import Tech Stacks
                    </Dialog.Title>
                    <p className="mt-2 text-sm text-gray-500">
                      Upload a CSV or JSON file to bulk import tech stacks
                    </p>
                  </div>

                  {records.length === 0 && (
                    <div className="mt-6">
                      <label
                        htmlFor="file-upload"
                        className="flex justify-center px-6 pt-8 pb-8 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors cursor-pointer"
                      >
                        <div className="space-y-2 text-center">
                          <ArrowUpTrayIcon className="mx-auto h-16 w-16 text-gray-400" />
                          <div className="text-base font-medium text-gray-700">
                            Click to upload a file
                          </div>
                          <p className="text-sm text-gray-500">
                            CSV or JSON files only
                          </p>
                          <input
                            ref={fileInputRef}
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            accept=".csv,.json"
                            className="sr-only"
                            onChange={handleFileUpload}
                          />
                        </div>
                      </label>

                      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">CSV Format Example:</h4>
                          <pre className="text-xs text-gray-600 overflow-x-auto">
{`label,slug,imgUrl
React,react,https://example.com/react.png
Vue,vue,https://example.com/vue.png`}
                          </pre>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">JSON Format Example:</h4>
                          <pre className="text-xs text-gray-600 overflow-x-auto">
{`[
  {
    "label": "React",
    "slug": "react",
    "imgUrl": "https://example.com/react.png"
  }
]`}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}

                  {records.length > 0 && (
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex gap-4 text-sm flex-wrap">
                          <span className="text-gray-600">
                            Total: <span className="font-semibold">{records.length}</span>
                          </span>
                          <span className="text-green-600">
                            Ready: <span className="font-semibold">{validCount}</span>
                          </span>
                          {warningCount > 0 && (
                            <span className="text-yellow-600">
                              Warnings: <span className="font-semibold">{warningCount}</span>
                            </span>
                          )}
                          {duplicateCount > 0 && (
                            <span className="text-orange-600">
                              Duplicates: <span className="font-semibold">{duplicateCount}</span>
                            </span>
                          )}
                          {invalidCount > 0 && (
                            <span className="text-red-600">
                              Invalid: <span className="font-semibold">{invalidCount}</span>
                            </span>
                          )}
                          {successCount > 0 && (
                            <span className="text-blue-600">
                              Imported: <span className="font-semibold">{successCount}</span>
                            </span>
                          )}
                          {errorCount > 0 && (
                            <span className="text-red-600">
                              Failed: <span className="font-semibold">{errorCount}</span>
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleRefreshValidation}
                            disabled={isImporting}
                            className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                            title="Re-validate all records"
                          >
                            Refresh
                          </button>
                          <button
                            onClick={() => setRecords([])}
                            disabled={isImporting}
                            className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                          >
                            Clear All
                          </button>
                          <button
                            onClick={handleImportAll}
                            disabled={isImporting || validCount === 0}
                            className="px-4 py-1 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 disabled:opacity-50"
                          >
                            {isImporting ? 'Importing...' : `Import All Valid (${validCount})`}
                          </button>
                        </div>
                      </div>

                      <div className="max-h-96 overflow-y-auto border rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50 sticky top-0">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Preview</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Label</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Image URL</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {records.map((record) => {
                              const statusInfo = [
                                ...record.errors,
                                ...record.warnings
                              ].join(', ');

                              return (
                                <tr key={record.tempId} className="hover:bg-gray-50">
                                  <td className="px-3 py-2 whitespace-nowrap">
                                    {record.status === 'valid' && record.warnings.length === 0 && (
                                      <CheckCircleIcon className="h-5 w-5 text-green-500" title="Ready to import" />
                                    )}
                                    {record.status === 'valid' && record.warnings.length > 0 && (
                                      <QuestionMarkCircleIcon className="h-5 w-5 text-yellow-500" title={record.warnings.join(', ')} />
                                    )}
                                    {record.status === 'duplicate' && (
                                      <ExclamationCircleIcon className="h-5 w-5 text-orange-500" title={statusInfo} />
                                    )}
                                    {record.status === 'invalid' && (
                                      <ExclamationCircleIcon className="h-5 w-5 text-red-500" title={statusInfo} />
                                    )}
                                    {record.status === 'importing' && (
                                      <div className="h-5 w-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                                    )}
                                    {record.status === 'success' && (
                                      <CheckCircleIcon className="h-5 w-5 text-blue-500" title="Imported successfully" />
                                    )}
                                    {record.status === 'error' && (
                                      <ExclamationCircleIcon className="h-5 w-5 text-red-600" title={statusInfo} />
                                    )}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap">
                                    {record.imgUrl && !['invalid', 'duplicate'].includes(record.status) && (
                                      <Image
                                        src={record.imgUrl}
                                        alt={record.label}
                                        width={32}
                                        height={32}
                                        className="rounded"
                                        unoptimized
                                      />
                                    )}
                                  </td>
                                  <td className="px-3 py-2">
                                    {editingId === record.tempId ? (
                                      <input
                                        type="text"
                                        value={editForm.label}
                                        onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                                        className="w-full px-2 py-1 text-sm border rounded"
                                      />
                                    ) : (
                                      <div>
                                        <span className="text-sm text-gray-900">{record.label}</span>
                                        {record.warnings.length > 0 && (
                                          <p className="text-xs text-yellow-600 mt-1">{record.warnings[0]}</p>
                                        )}
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-3 py-2">
                                    {editingId === record.tempId ? (
                                      <input
                                        type="text"
                                        value={editForm.slug}
                                        onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                                        className="w-full px-2 py-1 text-sm border rounded"
                                        placeholder="Auto-generated"
                                      />
                                    ) : (
                                      <span className="text-sm text-gray-500">
                                        {record.slug || generateSlug(record.label) || 'auto'}
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-3 py-2">
                                    {editingId === record.tempId ? (
                                      <input
                                        type="text"
                                        value={editForm.imgUrl}
                                        onChange={(e) => setEditForm({ ...editForm, imgUrl: e.target.value })}
                                        className="w-full px-2 py-1 text-sm border rounded"
                                      />
                                    ) : (
                                      <span className="text-xs text-gray-500 truncate max-w-xs block">{record.imgUrl}</span>
                                    )}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap">
                                    <div className="flex gap-1">
                                      {editingId === record.tempId ? (
                                        <>
                                          <button
                                            onClick={() => handleSaveEdit(record.tempId)}
                                            className="p-1 text-green-600 hover:text-green-900"
                                            title="Save"
                                          >
                                            <CheckCircleIcon className="h-4 w-4" />
                                          </button>
                                          <button
                                            onClick={() => setEditingId(null)}
                                            className="p-1 text-gray-600 hover:text-gray-900"
                                            title="Cancel"
                                          >
                                            <XMarkIcon className="h-4 w-4" />
                                          </button>
                                        </>
                                      ) : (
                                        <>
                                          {record.status !== 'success' && (
                                            <>
                                              <button
                                                onClick={() => handleEdit(record)}
                                                disabled={isImporting}
                                                className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                                                title="Edit"
                                              >
                                                <PencilSquareIcon className="h-4 w-4" />
                                              </button>
                                              {record.status === 'valid' && (
                                                <button
                                                  onClick={() => handleImportSingle(record)}
                                                  disabled={isImporting}
                                                  className="px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                                                  title="Import this record"
                                                >
                                                  Import
                                                </button>
                                              )}
                                            </>
                                          )}
                                          <button
                                            onClick={() => handleRemove(record.tempId)}
                                            disabled={isImporting}
                                            className="p-1 text-red-600 hover:text-red-900 disabled:opacity-50"
                                            title="Remove"
                                          >
                                            <XMarkIcon className="h-4 w-4" />
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {(records.some(r => r.errors.length > 0 && r.status !== 'success') || 
                        records.some(r => r.warnings.length > 0 && r.status === 'valid')) && (
                        <div className="mt-4 space-y-2">
                          {records.some(r => r.errors.length > 0 && r.status !== 'success') && (
                            <div className="bg-red-50 p-4 rounded-lg">
                              <h4 className="text-sm font-medium text-red-800 mb-2">Issues Found:</h4>
                              <ul className="text-xs text-red-700 space-y-1">
                                {records
                                  .filter(r => r.errors.length > 0 && r.status !== 'success')
                                  .map(r => (
                                    <li key={r.tempId}>
                                      <span className="font-medium">{r.label || 'Unnamed'}:</span> {r.errors.join(', ')}
                                    </li>
                                  ))}
                              </ul>
                            </div>
                          )}
                          
                          {records.some(r => r.warnings.length > 0 && r.status === 'valid') && (
                            <div className="bg-yellow-50 p-4 rounded-lg">
                              <h4 className="text-sm font-medium text-yellow-800 mb-2">Warnings (can still import):</h4>
                              <ul className="text-xs text-yellow-700 space-y-1">
                                {records
                                  .filter(r => r.warnings.length > 0 && r.status === 'valid')
                                  .map(r => (
                                    <li key={r.tempId}>
                                      <span className="font-medium">{r.label}:</span> {r.warnings.join(', ')}
                                    </li>
                                  ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-5 sm:mt-6">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-gray-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 sm:text-sm disabled:opacity-50"
                    onClick={handleClose}
                    ref={cancelButtonRef}
                    disabled={isImporting}
                  >
                    {successCount > 0 ? 'Done' : 'Cancel'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}