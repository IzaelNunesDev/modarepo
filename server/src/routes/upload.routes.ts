
import { Router, Request, Response } from 'express';
import multer from 'multer';
import { uploadFile } from '../services/storage.service';

const router = Router();

// Configura o multer para armazenar em memória (RAM) temporariamente
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // Limite de 5MB
    },
});

router.post('/', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'Nenhum arquivo enviado.' });
            return;
        }

        const buffer = req.file.buffer;
        const filename = req.file.originalname;
        const mimetype = req.file.mimetype;

        console.log(`📤 Upload iniciado: ${filename} (${mimetype})`);

        const publicUrl = await uploadFile(buffer, filename);

        res.status(200).json({
            message: 'Upload concluído com sucesso!',
            url: publicUrl,
        });
    } catch (error) {
        console.error('Erro no upload:', error);
        res.status(500).json({ error: 'Falha interna ao processar upload.' });
    }
});

export default router;
