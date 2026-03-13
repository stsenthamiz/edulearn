const PDFDocument = require('pdfkit');
const fs = require('fs');

/**
 * Utility to generate a dynamic PDF certificate
 */
exports.generateCompletionCertificate = async (req, res, next) => {
    try {
        const { studentName, subjectName } = req.body;

        // In a real production app, verify student actually completed all modules

        const doc = new PDFDocument({
            layout: 'landscape',
            size: 'A4',
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=certificate-${studentName.replace(/ /g, '-')}.pdf`);

        doc.pipe(res);

        // Draw realistic certificate UI
        doc.rect(0, 0, doc.page.width, doc.page.height).fill('#F0FDF4'); // Tailwind green-50

        doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
            .lineWidth(5)
            .stroke('#166534'); // Tailwind green-800

        doc.font('Helvetica-Bold')
            .fontSize(45)
            .fillColor('#1F2937')
            .text('Certificate of Completion', { align: 'center', margin: 60 });

        doc.moveDown();
        doc.font('Helvetica')
            .fontSize(20)
            .text('This proudly certifies that', { align: 'center' });

        doc.moveDown();
        doc.font('Helvetica-Bold')
            .fontSize(36)
            .fillColor('#2563EB') // Tailwind blue-600
            .text(studentName, { align: 'center' });

        doc.moveDown();
        doc.font('Helvetica')
            .fontSize(20)
            .fillColor('#1F2937')
            .text('has successfully completed all modules and quizzes for', { align: 'center' });

        doc.moveDown();
        doc.font('Helvetica-Bold')
            .fontSize(30)
            .fillColor('#9333EA') // Tailwind purple-600
            .text(subjectName, { align: 'center' });

        doc.moveDown(2);
        doc.font('Helvetica')
            .fontSize(16)
            .fillColor('#4B5563')
            .text(`Awarded on ${new Date().toLocaleDateString()}`, { align: 'center' });

        doc.end();

    } catch (error) {
        next(error);
    }
};
