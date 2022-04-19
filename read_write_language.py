from babel.messages.pofile import read_po, write_po
from babel.messages.catalog import Catalog


def generator(lang):
    pathSource = '/home/long/Desktop/work/olivia/src/ai_language/locale/' + lang + '/LC_MESSAGES/django.po'
    sentences = [
        "Configure all the different ways candidates can communicate with %(ai_name)s for your event.",
        # "Tools",
        # "Select language(s)",
    ]

    catalogSource = read_po(open(pathSource))

    # 1: Demo
    pathDestination = '/home/long/Desktop/work/tools/main.po'
    with open('/home/long/Desktop/work/tools/main.po', 'a') as outf:
        outf.write(lang + '\n')
        outf.close()

    # 2: Run to project
    # pathDestination = '/home/long/Desktop/work/olivia/src/ai_language/locale/' + lang + '/LC_MESSAGES/djangojs.po'
    # with open(pathDestination, 'a') as outf:
    #     outf.write('\n')
    #     outf.close()

    for message in catalogSource:
        if message.id in sentences:
            catalog = Catalog()
            catalog.add(id=message.id, string=message.string)
            from babel._compat import BytesIO
            buf = BytesIO()
            write_po(buf, catalog, omit_header=True, width=300)            
            with open(pathDestination, 'a') as outf:
                # 3: custom output 
                # outf.write(buf.getvalue().decode("utf8"))
                outf.write(buf.getvalue().decode("utf8").replace('%(ai_name)s', '%{name}').replace('#, python-format', ''))

# .replace('%s', '%{aiName}').replace('#, python-format', '')
# .replace('%(ai_name)s', '%{ai_name}').replace('#, python-format', '')
# .replace("{}", "<b>%{keyword}</b>", 1).replace("{}", "%{phoneNumber}", 1).replace("{}", "<b>%{keyword}</b>", 1).replace("{}", "%{phoneNumber}", 1)

langs = [
    "en",
    "es",
    "pt_BR",
    "fr",
    "fr_CA",
    "de",
    "zh_CN",
    "zh_TW",
    "tr",
    "nl",
    "hu",
    "it",
    "ko",
    "ru",
    "ja",
    "vi",
    "bs",
    "he",
    "ar",
    "bg",
    "hr",
    "cs",
    "el",
    "pl",
    "sr",
    "sk",
    "th",
    "uk",
    "ro",
    "es_EM",
    "es_MX",
    "pt"
]

for lang in langs:
    generator(lang)

