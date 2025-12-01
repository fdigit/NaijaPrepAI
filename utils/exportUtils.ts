import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType } from 'docx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { LessonContent } from '@/types';

/**
 * Convert markdown to plain text (simple implementation)
 */
function markdownToText(markdown: string): string {
  return markdown
    .replace(/^#+\s+/gm, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links, keep text
    .replace(/`([^`]+)`/g, '$1') // Remove code blocks
    .replace(/\n{3,}/g, '\n\n') // Normalize multiple newlines
    .trim();
}

/**
 * Export lesson as Word document
 */
export async function exportToWord(
  lesson: LessonContent,
  metadata?: {
    classLevel?: string;
    subject?: string;
    term?: string;
    week?: number;
    topic?: string;
  }
): Promise<void> {
  const children: (Paragraph | Table)[] = [];

  // Title
  children.push(
    new Paragraph({
      text: lesson.topicTitle,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Metadata (if provided)
  if (metadata) {
    const metadataText = [
      metadata.classLevel && `Class: ${metadata.classLevel}`,
      metadata.subject && `Subject: ${metadata.subject}`,
      metadata.term && `Term: ${metadata.term}`,
      metadata.week && `Week: ${metadata.week}`,
      metadata.topic && `Topic: ${metadata.topic}`,
    ]
      .filter(Boolean)
      .join(' | ');

    if (metadataText) {
      children.push(
        new Paragraph({
          text: metadataText,
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
        })
      );
    }
  }

  // Introduction
  children.push(
    new Paragraph({
      text: 'Introduction',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    })
  );
  children.push(
    new Paragraph({
      text: lesson.introduction,
      spacing: { after: 300 },
    })
  );

  // Main Content
  children.push(
    new Paragraph({
      text: 'Lesson Content',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    })
  );

  // Split main content by paragraphs and convert markdown to text
  const mainContentText = markdownToText(lesson.mainContent);
  const paragraphs = mainContentText.split('\n\n').filter(p => p.trim());
  paragraphs.forEach(para => {
    children.push(
      new Paragraph({
        text: para.trim(),
        spacing: { after: 200 },
      })
    );
  });

  // Summary Points
  if (lesson.summaryPoints.length > 0) {
    children.push(
      new Paragraph({
        text: 'Key Summary Points',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      })
    );

    lesson.summaryPoints.forEach((point, idx) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${idx + 1}. `,
              bold: true,
            }),
            new TextRun({
              text: point,
            }),
          ],
          spacing: { after: 150 },
        })
      );
    });
  }

  // Practice Questions
  if (lesson.practiceQuestions.length > 0) {
    children.push(
      new Paragraph({
        text: 'Practice Questions',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      })
    );

    lesson.practiceQuestions.forEach((q, qIdx) => {
      // Question
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Question ${qIdx + 1}: `,
              bold: true,
            }),
            new TextRun({
              text: q.question,
            }),
          ],
          spacing: { after: 150 },
        })
      );

      // Options
      q.options.forEach((opt, optIdx) => {
        const optionLabel = String.fromCharCode(65 + optIdx); // A, B, C, D
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${optionLabel}. `,
                bold: true,
              }),
              new TextRun({
                text: opt,
              }),
              ...(optIdx === q.correctOptionIndex
                ? [
                    new TextRun({
                      text: ' (Correct Answer)',
                      bold: true,
                      color: '006400',
                    }),
                  ]
                : []),
            ],
            indent: { left: 400 },
            spacing: { after: 100 },
          })
        );
      });

      // Explanation
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Explanation: ',
              bold: true,
            }),
            new TextRun({
              text: q.explanation,
            }),
          ],
          indent: { left: 400 },
          spacing: { after: 300 },
        })
      );
    });
  }

  // Theory Question
  if (lesson.theoryQuestion) {
    children.push(
      new Paragraph({
        text: 'Theory Question',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Question: ',
            bold: true,
          }),
          new TextRun({
            text: lesson.theoryQuestion.question,
          }),
        ],
        spacing: { after: 200 },
      })
    );

    const answerText = markdownToText(lesson.theoryQuestion.answer);
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Model Answer: ',
            bold: true,
          }),
          new TextRun({
            text: answerText,
          }),
        ],
        spacing: { after: 300 },
      })
    );
  }

  // Create document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  // Generate and download
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${lesson.topicTitle.replace(/[^a-z0-9]/gi, '_')}.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export lesson as PDF document
 */
export async function exportToPDF(
  lesson: LessonContent,
  metadata?: {
    classLevel?: string;
    subject?: string;
    term?: string;
    week?: number;
    topic?: string;
  }
): Promise<void> {
  // Create a temporary container element
  const container = document.createElement('div');
  container.style.width = '210mm'; // A4 width
  container.style.padding = '20mm';
  container.style.fontFamily = 'Arial, sans-serif';
  container.style.fontSize = '12pt';
  container.style.lineHeight = '1.6';
  container.style.color = '#000';
  container.style.backgroundColor = '#fff';
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';

  // Build HTML content
  let html = `
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="font-size: 24pt; margin-bottom: 10px; color: #00695C;">${lesson.topicTitle}</h1>
      ${metadata ? `
        <p style="color: #666; font-size: 10pt;">
          ${[
            metadata.classLevel && `Class: ${metadata.classLevel}`,
            metadata.subject && `Subject: ${metadata.subject}`,
            metadata.term && `Term: ${metadata.term}`,
            metadata.week && `Week: ${metadata.week}`,
            metadata.topic && `Topic: ${metadata.topic}`,
          ]
            .filter(Boolean)
            .join(' | ')}
        </p>
      ` : ''}
    </div>

    <div style="margin-bottom: 30px;">
      <h2 style="font-size: 18pt; color: #00695C; margin-bottom: 10px; border-bottom: 2px solid #00695C; padding-bottom: 5px;">Introduction</h2>
      <p style="text-align: justify;">${lesson.introduction}</p>
    </div>

    <div style="margin-bottom: 30px;">
      <h2 style="font-size: 18pt; color: #00695C; margin-bottom: 10px; border-bottom: 2px solid #00695C; padding-bottom: 5px;">Lesson Content</h2>
      <div style="text-align: justify; white-space: pre-wrap;">${markdownToText(lesson.mainContent)}</div>
    </div>
  `;

  // Summary Points
  if (lesson.summaryPoints.length > 0) {
    html += `
      <div style="margin-bottom: 30px;">
        <h2 style="font-size: 18pt; color: #00695C; margin-bottom: 10px; border-bottom: 2px solid #00695C; padding-bottom: 5px;">Key Summary Points</h2>
        <ul style="padding-left: 20px;">
          ${lesson.summaryPoints.map(point => `<li style="margin-bottom: 10px;">${point}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  // Practice Questions
  if (lesson.practiceQuestions.length > 0) {
    html += `
      <div style="margin-bottom: 30px;">
        <h2 style="font-size: 18pt; color: #00695C; margin-bottom: 10px; border-bottom: 2px solid #00695C; padding-bottom: 5px;">Practice Questions</h2>
        ${lesson.practiceQuestions
          .map(
            (q, qIdx) => `
          <div style="margin-bottom: 25px; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
            <p style="font-weight: bold; margin-bottom: 10px;">Question ${qIdx + 1}: ${q.question}</p>
            <ul style="list-style: none; padding-left: 0;">
              ${q.options
                .map(
                  (opt, optIdx) => `
              <li style="margin-bottom: 8px; padding-left: 20px;">
                <strong>${String.fromCharCode(65 + optIdx)}.</strong> ${opt}
                ${optIdx === q.correctOptionIndex ? ' <span style="color: #006400; font-weight: bold;">(Correct Answer)</span>' : ''}
              </li>
            `
                )
                .join('')}
            </ul>
            <p style="margin-top: 10px; padding: 10px; background-color: #f5f5f5; border-radius: 3px;">
              <strong>Explanation:</strong> ${q.explanation}
            </p>
          </div>
        `
          )
          .join('')}
      </div>
    `;
  }

  // Theory Question
  if (lesson.theoryQuestion) {
    html += `
      <div style="margin-bottom: 30px;">
        <h2 style="font-size: 18pt; color: #00695C; margin-bottom: 10px; border-bottom: 2px solid #00695C; padding-bottom: 5px;">Theory Question</h2>
        <div style="padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
          <p style="font-weight: bold; margin-bottom: 10px;">Question: ${lesson.theoryQuestion.question}</p>
          <div style="margin-top: 15px; padding: 10px; background-color: #f0f8f0; border-radius: 3px;">
            <strong>Model Answer:</strong>
            <div style="margin-top: 5px; white-space: pre-wrap;">${markdownToText(lesson.theoryQuestion.answer)}</div>
          </div>
        </div>
      </div>
    `;
  }

  container.innerHTML = html;
  document.body.appendChild(container);

  try {
    // Convert to canvas
    const canvas = await html2canvas(container, {
      useCORS: true,
      logging: false,
      background: '#ffffff',
    });

    // Calculate PDF dimensions (A4: 210mm x 297mm)
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    let position = 0;

    // Add first page
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if content is longer than one page
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Download PDF
    pdf.save(`${lesson.topicTitle.replace(/[^a-z0-9]/gi, '_')}.pdf`);
  } finally {
    // Clean up
    document.body.removeChild(container);
  }
}

