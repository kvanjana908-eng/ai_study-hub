import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Upload, 
  Sparkles, 
  Loader2, 
  BookOpen, 
  Image as ImageIcon, 
  Music, 
  FileCode, 
  FileCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { generateTopicMaterial, generateMaterialFromFile } from '../services/gemini';

export default function MaterialModal({ onClose, onSave }) {
  const [activeTab, setActiveTab] = useState('upload'); // Default to 'upload' as requested!
  
  // Topic input state
  const [topicInput, setTopicInput] = useState('');
  const [topicCategory, setTopicCategory] = useState('General Science');
  const [isGeneratingTopic, setIsGeneratingTopic] = useState(false);

  // Raw text state
  const [titleInput, setTitleInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('General');
  const [textContent, setTextContent] = useState('');

  // Universal File upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileSizeStr, setFileSizeStr] = useState('');
  const [fileType, setFileType] = useState('text'); // 'pdf' | 'image' | 'audio' | 'code' | 'document'
  const [mimeType, setMimeType] = useState('');
  const [base64Data, setBase64Data] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadedTextContent, setUploadedTextContent] = useState('');
  
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Handle AI Topic Generation
  const handleGenerateTopic = async () => {
    if (!topicInput.trim()) {
      setErrorMsg('Please enter a study topic or prompt.');
      return;
    }
    setErrorMsg('');
    setIsGeneratingTopic(true);
    try {
      const generatedMarkdown = await generateTopicMaterial(topicInput.trim());
      onSave({
        title: topicInput.trim(),
        category: topicCategory,
        icon: 'Atom',
        content: generatedMarkdown
      });
      onClose();
    } catch (err) {
      setErrorMsg(`AI Generation failed: ${err.message}`);
    } finally {
      setIsGeneratingTopic(false);
    }
  };

  // Handle Manual Text Save
  const handleSaveText = () => {
    if (!titleInput.trim() || !textContent.trim()) {
      setErrorMsg('Please provide both a title and study content.');
      return;
    }
    onSave({
      title: titleInput.trim(),
      category: categoryInput || 'General',
      icon: 'FileText',
      content: textContent.trim()
    });
    onClose();
  };

  // Detect file category from file object
  const detectFileType = (file) => {
    const name = file.name.toLowerCase();
    const type = file.type.toLowerCase();

    if (type === 'application/pdf' || name.endsWith('.pdf')) {
      return { category: 'pdf', mime: 'application/pdf', iconName: 'FileText' };
    }
    if (type.startsWith('image/') || /\.(png|jpe?g|webp|gif|bmp|svg)$/.test(name)) {
      let mime = type || 'image/png';
      if (name.endsWith('.jpg') || name.endsWith('.jpeg')) mime = 'image/jpeg';
      if (name.endsWith('.webp')) mime = 'image/webp';
      if (name.endsWith('.gif')) mime = 'image/gif';
      return { category: 'image', mime, iconName: 'Image' };
    }
    if (type.startsWith('audio/') || /\.(mp3|wav|m4a|ogg|flac|aac)$/.test(name)) {
      let mime = type || 'audio/mp3';
      return { category: 'audio', mime, iconName: 'Music' };
    }
    if (/\.(js|jsx|ts|tsx|py|c|cpp|cs|java|html|css|json|xml|csv|sql|sh|rb|go|rs)$/.test(name)) {
      return { category: 'code', mime: 'text/plain', iconName: 'FileCode' };
    }
    return { category: 'document', mime: type || 'text/plain', iconName: 'FileText' };
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Process File Selection
  const processFile = (file) => {
    if (!file) return;

    setErrorMsg('');
    setSelectedFile(file);
    setFileName(file.name);
    setFileSizeStr(formatFileSize(file.size));
    
    if (!titleInput) {
      setTitleInput(file.name.replace(/\.[^/.]+$/, ""));
    }

    const { category, mime } = detectFileType(file);
    setFileType(category);
    setMimeType(mime);

    // Read Base64 Data for Multimodal Gemini & Image preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target.result;
      setBase64Data(result);
      if (category === 'image') {
        setPreviewUrl(result);
      } else {
        setPreviewUrl('');
      }
    };
    reader.readAsDataURL(file);

    // Also read plain text if text/code/md file
    if (category === 'document' || category === 'code' || file.type.startsWith('text/')) {
      const textReader = new FileReader();
      textReader.onload = (e) => {
        setUploadedTextContent(e.target.result || '');
      };
      textReader.readAsText(file);
    } else {
      setUploadedTextContent('');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  // Drag & Drop Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  // Process and Save Upload with Gemini AI
  const handleProcessFileWithAI = async () => {
    if (!selectedFile || !base64Data && !uploadedTextContent) {
      setErrorMsg('Please select a file to process.');
      return;
    }

    setErrorMsg('');
    setIsProcessingFile(true);
    setProcessingStatus(`Gemini AI is analyzing ${fileName} (${fileType.toUpperCase()})...`);

    try {
      const markdownNotebook = await generateMaterialFromFile({
        fileName: titleInput || fileName,
        fileType,
        mimeType,
        base64Data,
        textContent: uploadedTextContent
      });

      onSave({
        title: titleInput || fileName.replace(/\.[^/.]+$/, ""),
        category: categoryInput || (fileType === 'pdf' ? 'PDF Study Guide' : fileType === 'image' ? 'Visual Notes' : 'Uploads'),
        icon: fileType === 'image' ? 'Image' : fileType === 'code' ? 'Cpu' : 'FileText',
        fileType,
        mediaUrl: fileType === 'image' ? base64Data : null,
        content: markdownNotebook
      });
      onClose();
    } catch (err) {
      console.error('File AI Digestion failed:', err);
      setErrorMsg(`AI Digestion Error: ${err.message}. You can try importing direct content instead.`);
    } finally {
      setIsProcessingFile(false);
      setProcessingStatus('');
    }
  };

  // Direct Save Without AI (for raw text / files)
  const handleSaveDirect = () => {
    if (!selectedFile) {
      setErrorMsg('Please select a file first.');
      return;
    }

    let finalContent = uploadedTextContent;
    if (!finalContent && fileType === 'image') {
      finalContent = `# 🖼️ ${titleInput || fileName}\n\nAttached visual study material image:\n\n![${fileName}](${base64Data})\n\nUse the **AI Summarizer**, **AI Tutor**, or **Quiz Engine** to analyze this notebook!`;
    } else if (!finalContent && fileType === 'pdf') {
      finalContent = `# 📄 ${titleInput || fileName}\n\nUploaded PDF document: **${fileName}** (${fileSizeStr}).\n\nClick **Generate AI Summary** or ask the **AI Tutor** to extract concepts from this material!`;
    } else if (!finalContent) {
      finalContent = `# 📁 ${titleInput || fileName}\n\nUploaded Material File: **${fileName}** (${fileSizeStr}).`;
    }

    onSave({
      title: titleInput || fileName.replace(/\.[^/.]+$/, ""),
      category: categoryInput || 'Uploads',
      icon: fileType === 'image' ? 'Image' : 'FileText',
      fileType,
      mediaUrl: fileType === 'image' ? base64Data : null,
      content: finalContent
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <h2>
            <BookOpen size={22} style={{ color: 'var(--accent-primary)' }} />
            <span>Add Study Material</span>
          </h2>
          <button className="btn-ghost" onClick={onClose} style={{ padding: '0.4rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="nav-tabs" style={{ justifyContent: 'center' }}>
          <button 
            className={`nav-tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            <Upload size={15} />
            <span>Upload File (PDF, PNG, etc.)</span>
          </button>
          <button 
            className={`nav-tab-btn ${activeTab === 'topic' ? 'active' : ''}`}
            onClick={() => setActiveTab('topic')}
          >
            <Sparkles size={15} />
            <span>AI Topic Generator</span>
          </button>
          <button 
            className={`nav-tab-btn ${activeTab === 'text' ? 'active' : ''}`}
            onClick={() => setActiveTab('text')}
          >
            <FileText size={15} />
            <span>Paste Notes</span>
          </button>
        </div>

        {errorMsg && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: 'var(--accent-rose)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tab 1: Multi-Format Upload (PDF, PNG, JPG, Text, Audio, Code) */}
        {activeTab === 'upload' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Upload any study material file: <strong>PDF textbooks</strong>, <strong>PNG/JPG images</strong> of notes, <strong>audio lectures</strong>, or code & documents. Gemini AI will OCR, extract formulas, and generate a complete study notebook!
            </p>

            {/* Dropzone Container */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{
                border: isDragging ? '2px dashed var(--accent-primary)' : '2px dashed var(--border-medium)',
                borderRadius: 'var(--radius-lg)',
                padding: '2rem 1.5rem',
                textAlign: 'center',
                background: isDragging ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-input)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              <input 
                type="file" 
                accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.bmp,.svg,.txt,.md,.doc,.docx,.csv,.json,.js,.ts,.py,.html,.css,.mp3,.wav,.m4a" 
                onChange={handleFileChange}
                id="file-upload-input"
                style={{ display: 'none' }}
              />
              <label htmlFor="file-upload-input" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justify-content: 'center',
                  color: 'var(--accent-primary)'
                }}>
                  <Upload size={26} />
                </div>
                <div>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>
                    {isDragging ? 'Drop file to upload' : 'Click or drag & drop file here'}
                  </span>
                  <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    Supports <strong>PDF</strong>, <strong>PNG/JPG Images</strong>, <strong>Markdown/TXT</strong>, <strong>Audio</strong> & <strong>Code</strong>
                  </p>
                </div>
              </label>
            </div>

            {/* Selected File Details & Preview Card */}
            {selectedFile && (
              <div style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {fileType === 'image' && <ImageIcon size={22} style={{ color: 'var(--accent-secondary)' }} />}
                    {fileType === 'pdf' && <FileText size={22} style={{ color: 'var(--accent-rose)' }} />}
                    {fileType === 'audio' && <Music size={22} style={{ color: 'var(--accent-amber)' }} />}
                    {fileType === 'code' && <FileCode size={22} style={{ color: 'var(--accent-emerald)' }} />}
                    {fileType === 'document' && <FileText size={22} style={{ color: 'var(--accent-primary)' }} />}

                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        {fileName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem', marginTop: '0.1rem' }}>
                        <span>Size: {fileSizeStr}</span>
                        <span>•</span>
                        <span style={{ textTransform: 'uppercase', color: 'var(--accent-primary)', fontWeight: 600 }}>
                          {fileType} format
                        </span>
                      </div>
                    </div>
                  </div>

                  <span style={{
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '20px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: 'var(--accent-emerald)',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    <CheckCircle2 size={13} />
                    Ready
                  </span>
                </div>

                {/* Image Preview Thumbnail if Image */}
                {fileType === 'image' && previewUrl && (
                  <div style={{
                    marginTop: '0.25rem',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    maxHeight: '160px',
                    display: 'flex',
                    justify-content: 'center',
                    background: '#000'
                  }}>
                    <img 
                      src={previewUrl} 
                      alt="Uploaded Material Preview" 
                      style={{ maxHeight: '160px', objectFit: 'contain', width: 'auto' }} 
                    />
                  </div>
                )}

                {/* Title & Category Inputs for File */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                      Material Title
                    </label>
                    <input 
                      type="text" 
                      value={titleInput}
                      onChange={(e) => setTitleInput(e.target.value)}
                      placeholder="e.g. Chapter 3 - Organic Reactions"
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                      Category
                    </label>
                    <input 
                      type="text" 
                      value={categoryInput}
                      onChange={(e) => setCategoryInput(e.target.value)}
                      placeholder="e.g. Chemistry"
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>
                </div>

                {/* Processing buttons */}
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button 
                    className="btn-primary"
                    onClick={handleProcessFileWithAI}
                    disabled={isProcessingFile}
                    style={{ flex: 2, justifyContent: 'center', padding: '0.65rem' }}
                  >
                    {isProcessingFile ? (
                      <>
                        <Loader2 size={18} className="spinner" />
                        <span>Gemini OCR & Digesting...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        <span>✨ AI Extract & Digest Notebook</span>
                      </>
                    )}
                  </button>

                  <button 
                    className="btn-secondary"
                    onClick={handleSaveDirect}
                    disabled={isProcessingFile}
                    style={{ flex: 1, justifyContent: 'center', padding: '0.65rem' }}
                  >
                    <FileCheck size={16} />
                    <span>Direct Import</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: AI Topic Generator */}
        {activeTab === 'topic' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Type any topic or question, and Gemini AI will generate a complete, structured study notebook with equations, concepts, and takeaways.
            </p>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Topic / Subject Prompt
              </label>
              <input 
                type="text" 
                placeholder="e.g. Organic Chemistry Functional Groups, Special Relativity, Macroeconomics..."
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Category
              </label>
              <select
                value={topicCategory}
                onChange={(e) => setTopicCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.9rem',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  fontFamily: 'inherit'
                }}
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Physics">Physics</option>
                <option value="Biology">Biology</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Economics">Economics</option>
                <option value="History">History</option>
                <option value="General Science">General Science</option>
              </select>
            </div>

            <button 
              className="btn-primary"
              onClick={handleGenerateTopic}
              disabled={isGeneratingTopic}
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
            >
              {isGeneratingTopic ? (
                <>
                  <Loader2 size={18} className="spinner" />
                  <span>Gemini is Drafting Study Guide...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Generate Complete Study Guide</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Tab 3: Paste Raw Text */}
        {activeTab === 'text' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Material Title
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Lecture 4 - Thermodynamics"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.9rem',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Category
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Physics"
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.9rem',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Study Content / Notes (Markdown or Text)
              </label>
              <textarea
                rows={8}
                placeholder="Paste textbook passages, lecture transcripts, code snippets, or notes here..."
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  fontFamily: 'var(--font-mono)',
                  resize: 'vertical'
                }}
              />
            </div>

            <button 
              className="btn-primary"
              onClick={handleSaveText}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <BookOpen size={18} />
              <span>Save Study Material</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
