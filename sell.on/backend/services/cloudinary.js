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
 * @param {Buffer} buffer
 * @param {{ folder: string, originalName: string }} options
 */
function uploadBuffer(buffer, options) {
  if (!configureCloudinary()) {
    return Promise.reject(new Error('Cloudinary não configurado'));
  }

  const safeName = (options.originalName || 'arquivo')
    .replace(/[^\w.\-]+/g, '_')
    .slice(0, 80);

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        resource_type: 'auto',
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
  });
}

function uploadCommissionAttachment(buffer, options) {
  return uploadBuffer(buffer, {
    folder: `sellon/commissions/${options.proposalId}`,
    originalName: options.originalName,
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
  uploadBuffer,
  uploadProposalAttachment,
  uploadCommissionAttachment,
  deleteCloudinaryAsset,
};
