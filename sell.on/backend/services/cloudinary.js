const cloudinary = require('cloudinary').v2;

function isCloudinaryConfigured() {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

function configureCloudinary() {
  if (!isCloudinaryConfigured()) return false;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return true;
}

/**
 * Cloudinary trata PDF como recurso "image" por padrão — e contas grátis
 * bloqueiam entrega de PDFs em /image/upload/*. Forçar "raw" para PDFs
 * (e demais documentos) faz a URL ser /raw/upload/* — sempre acessível.
 */
function pickResourceType(mimeType) {
  if (typeof mimeType !== 'string') return 'auto';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  return 'raw';
}

/**
 * @param {Buffer} buffer
 * @param {{ folder: string, originalName: string, mimeType?: string }} options
 */
function uploadBuffer(buffer, options) {
  if (!configureCloudinary()) {
    return Promise.reject(new Error('Cloudinary não configurado'));
  }

  const safeName = (options.originalName || 'arquivo')
    .replace(/[^\w.\-]+/g, '_')
    .slice(0, 80);

  const resourceType = options.resourceType || pickResourceType(options.mimeType);

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        resource_type: resourceType,
        use_filename: true,
        unique_filename: true,
        filename_override: safeName,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

function uploadProposalAttachment(buffer, options) {
  return uploadBuffer(buffer, {
    folder: `sellon/proposals/${options.proposalId}`,
    originalName: options.originalName,
    mimeType: options.mimeType,
  });
}

function uploadCommissionAttachment(buffer, options) {
  return uploadBuffer(buffer, {
    folder: `sellon/commissions/${options.proposalId}`,
    originalName: options.originalName,
    mimeType: options.mimeType,
  });
}

async function deleteCloudinaryAsset(publicId, resourceType = 'raw') {
  if (!configureCloudinary()) {
    throw new Error('Cloudinary não configurado');
  }
  const type = resourceType === 'image' ? 'image' : resourceType === 'video' ? 'video' : 'raw';
  return cloudinary.uploader.destroy(publicId, { resource_type: type });
}

module.exports = {
  isCloudinaryConfigured,
  pickResourceType,
  uploadBuffer,
  uploadProposalAttachment,
  uploadCommissionAttachment,
  deleteCloudinaryAsset,
};
