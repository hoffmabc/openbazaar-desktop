import $ from 'jquery';
import app from '../../app';
import loadTemplate from '../../utils/loadTemplate';
import BaseModal from './BaseModal';
import { openSimpleMessage } from './SimpleMessage';

export default class extends BaseModal {
  constructor(options = {}) {
    super(options);

    this._state = {
      reporting: false,
      ...options.initialState || {},
    };

    if (!options.peerID) throw new Error('You must provide a peerID.');
    if (!options.slug) throw new Error('You must provide a slug.');
    if (!options.url) throw new Error('You must provide a url.');

    this.peerID = options.peerID;
    this.slug = options.slug;
    this.url = options.url;
  }

  className() {
    return `${super.className()} report modalTop modalScrollPage modalNarrow`;
  }

  events() {
    return {
      'keyup .js-otherInput': 'onKeyupOtherInput',
      'click .js-submit': 'onClickSubmit',
      ...super.events(),
    };
  }

  onKeyupOtherInput() {
    this.getCachedEl('#ReasonOther').prop('checked', true);
  }

  onClickSubmit() {
    const data = {};
    data.peerID = this.peerID;
    data.slug = this.slug;
    const formData = this.getFormData();
    data.reason = formData.reason === 'Other' ? formData.other : formData.reason;
    this.setState({
      reporting: true,
    });
    $.ajax({
      url: this.url,
      data: JSON.stringify(data),
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json',
    })
      .done(() => {
        this.trigger('submitted');
      })
      .fail((xhr) => {
        let failReason = xhr.responseJSON && xhr.responseJSON.reason || '';
        if (xhr.status === 404) failReason = app.polyglot.t('listingReport.error404');
        openSimpleMessage(
          app.polyglot.t('listingReport.errorTitle'),
          failReason
        );
      })
      .always(() => {
        this.close();
      });
  }

  render() {
    loadTemplate('modals/report.html', (t) => {
      this.$el.html(t({
        ...this.options,
        ...this._state,
      }));

      super.render();
    });

    return this;
  }
}
