import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Preview,
} from '@react-email/components';
import { SurveyConfig } from './types';

interface SurveyEmailProps {
  surveyConfig: SurveyConfig;
  answers: Record<string, any>;
  respondent?: {
    name?: string;
    email?: string;
    company?: string;
  };
  submittedAt: string;
  ipAddress: string;
}

export function SurveyEmailTemplate({
  surveyConfig,
  answers,
  respondent,
  submittedAt,
  ipAddress,
}: SurveyEmailProps) {
  const previewText = `Yeni Anket Yanıtı: ${surveyConfig.title}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          {/* Header Section */}
          <Section style={headerSectionStyle}>
            <Text style={badgeStyle}>SURVEY SYSTEM</Text>
            <Text style={titleStyle}>{surveyConfig.title}</Text>
            <Text style={metaStyle}>
              Tarih: {submittedAt} &bull; IP: {ipAddress}
            </Text>
          </Section>

          <Hr style={hrStyle} />

          {/* Respondent Info Section */}
          {respondent && (respondent.name || respondent.email || respondent.company) && (
            <Section style={cardStyle}>
              <Text style={cardTitleStyle}>Katılımcı Bilgileri</Text>
              {respondent.name && (
                <Text style={infoTextStyle}>
                  <strong>Ad Soyad:</strong> {respondent.name}
                </Text>
              )}
              {respondent.email && (
                <Text style={infoTextStyle}>
                  <strong>E-posta:</strong> {respondent.email}
                </Text>
              )}
              {respondent.company && (
                <Text style={infoTextStyle}>
                  <strong>Şirket:</strong> {respondent.company}
                </Text>
              )}
            </Section>
          )}

          {/* Responses Section */}
          <Section style={{ marginTop: '20px' }}>
            <Text style={cardTitleStyle}>Yanıtlar</Text>
            {surveyConfig.questions.map((q, idx) => {
              const rawAnswer = answers[q.id];
              const qLabel = q.label.tr || q.label.en;

              return (
                <div key={q.id} style={questionBoxStyle}>
                  <Text style={questionNumberStyle}>Soru {idx + 1}</Text>
                  <Text style={questionLabelStyle}>{qLabel}</Text>

                  {/* Render based on Question Type */}
                  {q.type === 'rating' && (
                    <div style={ratingBoxStyle}>
                      <span style={ratingNumberStyle}>{rawAnswer ?? '-'}</span>
                      <span style={ratingMaxStyle}> / {q.max}</span>
                    </div>
                  )}

                  {q.type === 'multi_choice' && (
                    <div style={{ marginTop: '8px' }}>
                      {Array.isArray(rawAnswer) && rawAnswer.length > 0 ? (
                        rawAnswer.map((optId: string) => {
                          const option = q.options?.find((o) => o.id === optId);
                          const optLabel = option ? (option.label.tr || option.label.en) : optId;
                          return (
                            <Text key={optId} style={bulletItemStyle}>
                              &bull; {optLabel}
                            </Text>
                          );
                        })
                      ) : (
                        <Text style={answerTextStyle}>-</Text>
                      )}
                    </div>
                  )}

                  {q.type === 'single_choice' && (
                    <Text style={answerTextStyle}>
                      {(() => {
                        const option = q.options?.find((o) => o.id === rawAnswer);
                        return option ? (option.label.tr || option.label.en) : (rawAnswer || '-');
                      })()}
                    </Text>
                  )}

                  {(q.type === 'short_text' || q.type === 'long_text') && (
                    <Text style={answerTextStyle}>{rawAnswer || '-'}</Text>
                  )}
                </div>
              );
            })}
          </Section>

          <Hr style={hrStyle} />

          <Text style={footerStyle}>
            Bu e-posta İzole Anket Sistemi tarafından otomatik olarak gönderilmiştir.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Inline CSS Styles for Email Client Compatibility
const mainStyle: React.CSSProperties = {
  backgroundColor: '#f4f4f0',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  padding: '30px 0',
};

const containerStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '32px',
  borderRadius: '12px',
  maxWidth: '600px',
  border: '1px solid rgba(26, 26, 26, 0.1)',
};

const headerSectionStyle: React.CSSProperties = {
  textAlign: 'left',
};

const badgeStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '1px',
  color: '#d94625',
  textTransform: 'uppercase',
  margin: '0 0 8px 0',
};

const titleStyle: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: 700,
  color: '#1a1a1a',
  margin: '0 0 8px 0',
};

const metaStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#6b6b6b',
  margin: 0,
};

const hrStyle: React.CSSProperties = {
  borderColor: 'rgba(26, 26, 26, 0.1)',
  margin: '24px 0',
};

const cardStyle: React.CSSProperties = {
  backgroundColor: '#fafafa',
  padding: '16px 20px',
  borderRadius: '8px',
  border: '1px solid #eaeaea',
};

const cardTitleStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 600,
  color: '#1a1a1a',
  margin: '0 0 12px 0',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const infoTextStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#333333',
  margin: '4px 0',
};

const questionBoxStyle: React.CSSProperties = {
  marginBottom: '20px',
  padding: '16px',
  backgroundColor: '#fafafa',
  borderRadius: '8px',
  borderLeft: '4px solid #d94625',
};

const questionNumberStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  color: '#6b6b6b',
  margin: '0 0 4px 0',
  textTransform: 'uppercase',
};

const questionLabelStyle: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: 600,
  color: '#1a1a1a',
  margin: '0 0 8px 0',
};

const answerTextStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#2a2a2a',
  margin: '0',
  whiteSpace: 'pre-wrap',
};

const bulletItemStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#2a2a2a',
  margin: '2px 0',
};

const ratingBoxStyle: React.CSSProperties = {
  display: 'inline-block',
  backgroundColor: '#f4f4f0',
  padding: '8px 16px',
  borderRadius: '6px',
  marginTop: '4px',
};

const ratingNumberStyle: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: 700,
  color: '#d94625',
};

const ratingMaxStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#6b6b6b',
};

const footerStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#888888',
  textAlign: 'center',
  margin: 0,
};
