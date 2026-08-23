import { Share, Linking, Platform } from 'react-native';
import { Board, Pin } from '../types';

export const shareService = {
  // Format pin text for messaging or Instagram story caption
  formatPinText(pin: Pin): string {
    let content = '';
    switch (pin.type) {
      case 'photo':
        content = `${pin.caption ? `"${pin.caption}"\n` : ''}${pin.location ? `📍 ${pin.location}\n` : ''}${pin.handwrittenDate ? `🗓 ${pin.handwrittenDate}` : ''}`;
        break;
      case 'text':
        content = `${pin.title ? `*${pin.title}*\n\n` : ''}${pin.body}${pin.authorNote ? `\n— ${pin.authorNote}` : ''}`;
        break;
      case 'thought':
        content = `"${pin.thought}"`;
        break;
      case 'quote':
        content = `“${pin.quote}”\n${pin.author ? `— ${pin.author}` : ''}${pin.source ? ` (${pin.source})` : ''}`;
        break;
      case 'checklist':
        content = `*${pin.title}*\n${pin.items.map((it) => `${it.completed ? '✓' : '☐'} ${it.text}`).join('\n')}`;
        break;
      case 'music':
        content = `🎵 *${pin.songTitle}* — ${pin.artist}${pin.personalMemoryNote ? `\n\n"${pin.personalMemoryNote}"` : ''}${pin.spotifyUrl ? `\nListen: ${pin.spotifyUrl}` : ''}`;
        break;
      case 'voicenote':
        content = `🎙 *${pin.title}*\n${pin.transcriptExcerpt || 'Voice Note'}`;
        break;
      case 'link':
        content = `🔗 *${pin.headline}*\n${pin.siteName ? `Source: ${pin.siteName}\n` : ''}${pin.url}`;
        break;
      case 'journal':
        content = `📖 *${pin.headline}* (${pin.dateLabel})\n\n${pin.paragraphs.join('\n\n')}`;
        break;
      default:
        content = pin.title || 'Commonplace note';
    }

    return `${content}\n\n— commonplace`;
  },

  // Share directly to WhatsApp
  async shareToWhatsApp(pinOrText: Pin | string) {
    const text = typeof pinOrText === 'string' ? pinOrText : this.formatPinText(pinOrText);
    const encoded = encodeURIComponent(text);
    const whatsappUrl = `whatsapp://send?text=${encoded}`;
    const webWhatsappUrl = `https://api.whatsapp.com/send?text=${encoded}`;

    try {
      if (Platform.OS === 'web') {
        window.open(webWhatsappUrl, '_blank');
        return;
      }

      const canOpen = await Linking.canOpenURL(whatsappUrl);
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
      } else {
        await Linking.openURL(webWhatsappUrl);
      }
    } catch (e) {
      await this.shareNative({ message: text });
    }
  },

  // Share to Instagram / Stories
  async shareToInstagram(pinOrText: Pin | string) {
    const text = typeof pinOrText === 'string' ? pinOrText : this.formatPinText(pinOrText);
    
    // Copy story text to clipboard if possible
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
    } catch (e) {}

    const instagramUrl = 'instagram://app';
    const webInstagramUrl = 'https://www.instagram.com';

    try {
      if (Platform.OS === 'web') {
        window.open(webInstagramUrl, '_blank');
        return;
      }

      const canOpen = await Linking.canOpenURL(instagramUrl);
      if (canOpen) {
        await Linking.openURL(instagramUrl);
      } else {
        await this.shareNative({ message: text, title: 'Share to Instagram' });
      }
    } catch (e) {
      await this.shareNative({ message: text, title: 'Share to Instagram' });
    }
  },

  // Share Board summary
  formatBoardText(board: Board): string {
    const header = `📖 *${board.title}*${board.subtitle ? `\n_${board.subtitle}_` : ''}\n${board.pins.length} items in this space\n\n`;
    const preview = board.pins.slice(0, 4).map((p) => `• ${p.title || p.type}`).join('\n');
    return `${header}${preview}\n\n— Curated in Commonplace Scrapbook`;
  },

  async shareBoardToWhatsApp(board: Board) {
    await this.shareToWhatsApp(this.formatBoardText(board));
  },

  async shareBoardToInstagram(board: Board) {
    await this.shareToInstagram(this.formatBoardText(board));
  },

  // Native iOS / Android / Web Share Dialog
  async shareNative(options: { title?: string; message: string; url?: string }) {
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && (navigator as any).share) {
        await (navigator as any).share(options);
        return;
      }
      await Share.share({
        title: options.title || 'Commonplace Scrapbook',
        message: options.message,
        url: options.url,
      });
    } catch (e) {
      console.warn('Sharing failed', e);
    }
  },
};
