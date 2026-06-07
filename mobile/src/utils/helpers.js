import config from '../constants/config';

export const resolveImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${config.API_BASE_URL}${url}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTime = (timeString) => {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

export const formatPrice = (price, currency = 'INR') => {
  if (price === 0) return 'Free';
  if (currency === 'INR') {
    return `₹${price.toLocaleString('en-IN')}`;
  }
  return `$${price.toLocaleString()}`;
};

export const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const getRelativeTime = (dateString) => {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return '#F59E0B';
    case 'confirmed': return '#3B82F6';
    case 'completed': return '#10B981';
    case 'cancelled': return '#EF4444';
    case 'rescheduled': return '#8B5CF6';
    default: return '#6B7280';
  }
};

export const getCategoryLabel = (category) => {
  const map = {
    'career-guidance': 'Career Guidance',
    'psychometric': 'Psychometric',
    'skill-development': 'Skill Development',
    'competitive-exams': 'Competitive Exams',
    'personality-development': 'Personality Development',
    'communication': 'Communication',
    'technology': 'Technology',
    'entrepreneurship': 'Entrepreneurship',
    'career-tips': 'Career Tips',
    'exam-preparation': 'Exam Prep',
    'success-stories': 'Success Stories',
    'industry-insights': 'Industry Insights',
    'mentorship': 'Mentorship',
    'wellness': 'Wellness',
    'startup': 'Startup',
    'other': 'Other',
  };
  return map[category] || category;
};

export const cleanTags = (tagsArray) => {
  if (!tagsArray) return [];
  if (typeof tagsArray === 'string') {
    tagsArray = [tagsArray];
  }
  if (!Array.isArray(tagsArray)) return [];
  
  let result = [];
  
  const processTagString = (str) => {
    if (!str) return;
    
    // Try to parse if it is double/single stringified JSON
    const trimmed = str.trim();
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(str);
        if (Array.isArray(parsed)) {
          parsed.forEach(item => processTagString(item));
          return;
        } else if (typeof parsed === 'string') {
          processTagString(parsed);
          return;
        }
      } catch (e) {
        // Fallback to manual string cleanup if JSON parse fails
      }
    }
    
    // Clean string from brackets, escaped quotes, etc.
    let clean = str
      .replace(/[\[\]"']/g, '') // remove brackets and quotes
      .replace(/\\/g, '')       // remove backslashes
      .trim();
      
    if (clean) {
      if (clean.includes(',')) {
        clean.split(',').forEach(sub => {
          const subClean = sub.replace(/[\[\]"']/g, '').trim();
          if (subClean) result.push(subClean);
        });
      } else {
        result.push(clean);
      }
    }
  };
  
  tagsArray.forEach(tag => processTagString(tag));
  
  return result;
};

// Alias for getRelativeTime (used by chat & community screens)
export const formatTimeAgo = getRelativeTime;
