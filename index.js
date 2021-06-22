const {
    WAConnection,
    MessageType,
    Presence,
    Mimetype,
    GroupSettingChange
} = require('@adiwajshing/baileys')
const { color, bgcolor } = require('./lib/color')
const { help } = require('./src/help')
const { getBuffer, h2k, generateMessageID, getGroupAdmins, getRandom, banner, start, info, success, close } = require('./lib/functions')
const { fetchJson, fetchText } = require('./lib/fetcher')
const { recognize } = require('./lib/ocr')
const fs = require('fs')
const moment = require('moment-timezone')
const { exec } = require('child_process')
const fetch = require('node-fetch')
const ffmpeg = require('fluent-ffmpeg')
const { removeBackgroundFromImageFile } = require('remove.bg')
const lolis = require('lolis.life')
const loli = new lolis()
const double = Math.floor(Math.random() * 2) + 1
const welkom = JSON.parse(fs.readFileSync('./src/welkom.json'))
const samih = JSON.parse(fs.readFileSync('./src/simi.json'))
const setting = JSON.parse(fs.readFileSync('./src/settings.json'))
prefix = '/'
blocked = []
ban = []

function kyun(seconds){
  function pad(s){
    return (s < 10 ? '0' : '') + s;
  }
  var hours = Math.floor(seconds / (60*60));
  var minutes = Math.floor(seconds % (60*60) / 60);
  var seconds = Math.floor(seconds % 60);

  //return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds)
  return `${pad(hours)} Hrs ${pad(minutes)} Min ${pad(seconds)} Seg`
}

async function starts() {
	const thoth = new WAConnection()
	thoth.logger.level = 'warn'
	console.log(banner.string)
	thoth.on('qr', () => {
		console.log(color('[','white'), color('!','red'), color(']','white'), color(' Scan the qr code above'))
	})
	fs.existsSync('./BarBar.json') && thoth.loadAuthInfo('./BarBar.json')
	thoth.on('connecting', () => {
		start('2', 'Connecting...')
	})
	thoth.on('open', () => {
		success('2', 'Connected')
	})
	await thoth.connect({timeoutMs: 30*1000})
        fs.writeFileSync('./BarBar.json', JSON.stringify(thoth.base64EncodedAuthInfo(), null, '\t'))

	thoth.on('group-participants-update', async (anu) => {
		if (!welkom.includes(anu.jid)) return
		try {
			const mdata = await thoth.groupMetadata(anu.jid)
			console.log(anu)
			if (anu.action == 'add') {
				num = anu.participants[0]
				try {
					ppimg = await thoth.getProfilePicture(`${anu.participants[0].split('@')[0]}@c.us`)
				} catch {
					ppimg = 'https://i0.wp.com/www.gambarunik.id/wp-content/uploads/2019/06/Top-Gambar-Foto-Profil-Kosong-Lucu-Tergokil-.jpg'
				}
				teks = `Bem vindo(a) @${num.split('@')[0]}\n *${mdata.subject}*`
				let buff = await getBuffer(ppimg)
				thoth.sendMessage(mdata.id, buff, MessageType.image, {caption: teks, contextInfo: {"mentionedJid": [num]}})
			} else if (anu.action == 'remove') {
				num = anu.participants[0]
				try {
					ppimg = await thoth.getProfilePicture(`${num.split('@')[0]}@c.us`)
				} catch {
					ppimg = 'https://i0.wp.com/www.gambarunik.id/wp-content/uploads/2019/06/Top-Gambar-Foto-Profil-Kosong-Lucu-Tergokil-.jpg'
				}
				teks = `Espero que você volte algum dia @${num.split('@')[0]}`
				let buff = await getBuffer(ppimg)
				thoth.sendMessage(mdata.id, buff, MessageType.image, {caption: teks, contextInfo: {"mentionedJid": [num]}})
			}
		} catch (e) {
			console.log('Error : %s', color(e, 'red'))
		}
	})
	
	thoth.on('CB:Blocklist', json => {
            if (blocked.length > 2) return
	    for (let i of json[1].blocklist) {
	    	blocked.push(i.replace('c.us','s.whatsapp.net'))
	    }
	})

	thoth.on('chat-update', async (mek) => {
		try {
            if (!mek.hasNewMessage) return
            mek = mek.messages.all()[0]
			if (!mek.message) return
			if (mek.key && mek.key.remoteJid == 'status@broadcast') return
			if (mek.key.fromMe) return
			global.prefix
			global.blocked
			const content = JSON.stringify(mek.message)
			const from = mek.key.remoteJid
			const type = Object.keys(mek.message)[0]
			const apiKey = setting.apiKey // me chama whatsapp wa.me/7499260572
			const { text, extendedText, contact, location, liveLocation, image, video, sticker, document, audio, product } = MessageType
			const time = moment.tz('America/Sao_Paulo').format('DD/MM HH:mm:ss')
			body = (type === 'conversation' && mek.message.conversation.startsWith(prefix)) ? mek.message.conversation : (type == 'imageMessage') && mek.message.imageMessage.caption.startsWith(prefix) ? mek.message.imageMessage.caption : (type == 'videoMessage') && mek.message.videoMessage.caption.startsWith(prefix) ? mek.message.videoMessage.caption : (type == 'extendedTextMessage') && mek.message.extendedTextMessage.text.startsWith(prefix) ? mek.message.extendedTextMessage.text : ''
			budy = (type === 'conversation') ? mek.message.conversation : (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text : ''
			const command = body.slice(1).trim().split(/ +/).shift().toLowerCase()
			const args = body.trim().split(/ +/).slice(1)
                        var pes = (type === 'conversation' && mek.message.conversation) ? mek.message.conversation : (type == 'imageMessage') && mek.message.imageMessage.caption ? mek.message.imageMessage.caption : (type == 'videoMessage') && mek.message.videoMessage.caption ? mek.message.videoMessage.caption : (type == 'extendedTextMessage') && mek.message.extendedTextMessage.text ? mek.message.extendedTextMessage.text : ''
			const messagesC = pes.slice(0).trim().split(/ +/).shift().toLowerCase()
			const isCmd = body.startsWith(prefix)

			mess = {
				wait: '⌛ Em processo ⌛',
				success: '✔️ Sucesso ✔️',
				error: {
					stick: '❌ Ocorreu um erro ao converter a imagem em sticker ❌',
					Iv: ' Link inválido '
				},
				only: {
					group: ' Este comando só pode ser usado em grupos! ',
					ownerG: ' Este comando só pode ser usado pelo dono do grupo! ',
					ownerB: ' Este comando só pode ser usado pelo meu dono! ',
					admin: ' Você não é adm! ',
					Badmin: ' Preciso ser adm! '
				}
			}

			const botNumber = thoth.user.jid
			const ownerNumber = ["557499260572@s.whatsapp.net"]
			const isGroup = from.endsWith('@g.us')
			const sender = isGroup ? mek.participant : mek.key.remoteJid
			const groupMetadata = isGroup ? await thoth.groupMetadata(from) : ''
			const groupName = isGroup ? groupMetadata.subject : ''
			const groupId = isGroup ? groupMetadata.jid : ''
			const groupMembers = isGroup ? groupMetadata.participants : ''
			const groupAdmins = isGroup ? getGroupAdmins(groupMembers) : ''
			const isBotGroupAdmins = groupAdmins.includes(botNumber) || false
			const isGroupAdmins = groupAdmins.includes(sender) || false
			const isWelkom = isGroup ? welkom.includes(from) : false
			const isBanned = ban.includes(sender)
			const isSimi = isGroup ? samih.includes(from) : false
			const isOwner = ownerNumber.includes(sender)
			pushname = thoth.contacts[sender] != undefined ? thoth.contacts[sender].vname || thoth.contacts[sender].notify : undefined
			const isUrl = (url) => {
			    return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))
			}
			const reply = (teks) => {
				thoth.sendMessage(from, teks, text, {quoted:mek})
			}
			const sendMess = (hehe, teks) => {
				thoth.sendMessage(hehe, teks, text)
			}
			const mentions = (teks, memberr, id) => {
				(id == null || id == undefined || id == false) ? thoth.sendMessage(from, teks.trim(), extendedText, {contextInfo: {"mentionedJid": memberr}}) : thoth.sendMessage(from, teks.trim(), extendedText, {quoted: mek, contextInfo: {"mentionedJid": memberr}})
			}
			colors = ['red','white','black','blue','yellow','green']
			const isMedia = (type === 'imageMessage' || type === 'videoMessage')
			const isQuotedImage = type === 'extendedTextMessage' && content.includes('imageMessage')
			const isQuotedVideo = type === 'extendedTextMessage' && content.includes('videoMessage')
			const isQuotedSticker = type === 'extendedTextMessage' && content.includes('stickerMessage')
			if (!isGroup && isCmd) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;32mEXEC\x1b[1;37m]', time, color(command), 'from', color(sender.split('@')[0]), 'args :', color(args.length))
			if (!isGroup && !isCmd) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;31mRECV\x1b[1;37m]', time, color('Message'), 'from', color(sender.split('@')[0]), 'args :', color(args.length))
			if (isCmd && isGroup) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;32mEXEC\x1b[1;37m]', time, color(command), 'from', color(sender.split('@')[0]), 'in', color(groupName), 'args :', color(args.length))
			if (!isCmd && isGroup) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;31mRECV\x1b[1;37m]', time, color('Message'), 'from', color(sender.split('@')[0]), 'in', color(groupName), 'args :', color(args.length))
			let authorname = thoth.contacts[from] != undefined ? thoth.contacts[from].vname || thoth.contacts[from].notify : undefined	
			if (authorname != undefined) { } else { authorname = groupName }	
			
			function addMetadata(packname, author) {	
				if (!packname) packname = '557499260572t'; if (!author) author = 'AmandaBot';	
				author = author.replace(/[^a-zA-Z0-9]/g, '');	
				let name = `${author}_${packname}`
				if (fs.existsSync(`./src/stickers/${name}.exif`)) return `./src/stickers/${name}.exif`
				const json = {	
					"sticker-pack-name": packname,
					"sticker-pack-publisher": author,
				}
				const littleEndian = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00])	
				const bytes = [0x00, 0x00, 0x16, 0x00, 0x00, 0x00]	

				let len = JSON.stringify(json).length	
				let last	

				if (len > 256) {	
					len = len - 256	
					bytes.unshift(0x01)	
				} else {	
					bytes.unshift(0x00)	
	}
				if (len < 16) {	
					last = len.toString(16)	
					last = "0" + len	
				} else {	
					last = len.toString(16)	
				}	

				const buf2 = Buffer.from(last, "hex")	
				const buf3 = Buffer.from(bytes)	
				const buf4 = Buffer.from(JSON.stringify(json))	

				const buffer = Buffer.concat([littleEndian, buf2, buf3, buf4])	

				fs.writeFile(`./src/stickers/${name}.exif`, buffer, (err) => {	
					return `./src/stickers/${name}.exif`	
				})	
					
			}
			switch(command) {
		                 case 'lista':
					case 'menu':
				    menuimg = fs.readFileSync('./assets/menuimg.jpg')
					thoth.sendMessage(from, menuimg, image, {quoted: mek, caption: help(prefix), text})
                    lima = fs.readFileSync('./assets/menuv.mp3');
                    thoth.sendMessage(from, lima, MessageType.audio, {quoted: mek, mimetype: 'audio/mp4', ptt:true})
					break
				case 'lista':
					case 'help':
				    menuimg = fs.readFileSync('./assets/help.jpg')
					thoth.sendMessage(from, menuimg, image, {quoted: mek, caption: help(prefix), text})
                    lima = fs.readFileSync('./assets/menuv.mp3');
                    thoth.sendMessage(from, lima, MessageType.audio, {quoted: mek, mimetype: 'audio/mp4', ptt:true})
					break
				case 's':
				case 'fga':
				case 'sticker':
					if ((isMedia && !mek.message.videoMessage || isQuotedImage) && args.length == 0) {
						const encmedia = isQuotedImage ? JSON.parse(JSON.stringify(mek).replace('quotedM','m')).message.extendedTextMessage.contextInfo : mek
						const media = await thoth.downloadAndSaveMediaMessage(encmedia)
						ran = getRandom('.webp')
						await ffmpeg(`./${media}`)
							.input(media)
							.on('start', function (cmd) {
								console.log(`Started : ${cmd}`)
							})
							.on('error', function (err) {
								console.log(`Error : ${err}`)
								fs.unlinkSync(media)
								reply(mess.error.stick)
							})
							.on('end', function () {
								console.log('Finish')
								exec(`webpmux -set exif ${addMetadata('AmandaBot', authorname)} ${ran} -o ${ran}`, async (error) => {
									if (error) return reply(mess.error.stick)
									thoth.sendMessage(from, fs.readFileSync(ran), sticker, {quoted: mek})
									fs.unlinkSync(media)	
									fs.unlinkSync(ran)	
								})
								/*thoth.sendMessage(from, fs.readFileSync(ran), sticker, {quoted: mek})
								fs.unlinkSync(media)
								fs.unlinkSync(ran)*/
							})
							.addOutputOptions([`-vcodec`,`libwebp`,`-vf`,`scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`])
							.toFormat('webp')
							.save(ran)
					} else if ((isMedia && mek.message.videoMessage.seconds < 11 || isQuotedVideo && mek.message.extendedTextMessage.contextInfo.quotedMessage.videoMessage.seconds < 11) && args.length == 0) {
						const encmedia = isQuotedVideo ? JSON.parse(JSON.stringify(mek).replace('quotedM','m')).message.extendedTextMessage.contextInfo : mek
						const media = await thoth.downloadAndSaveMediaMessage(encmedia)
						ran = getRandom('.webp')
						reply(mess.wait)
						await ffmpeg(`./${media}`)
							.inputFormat(media.split('.')[1])
							.on('start', function (cmd) {
								console.log(`Started : ${cmd}`)
							})
							.on('error', function (err) {
								console.log(`Error : ${err}`)
								fs.unlinkSync(media)
								tipe = media.endsWith('.mp4') ? 'video' : 'gif'
								reply(`Falha no momento da conversão ${tipe} para sticker!`)
							})
							.on('end', function () {
								console.log('Finish')
								exec(`webpmux -set exif ${addMetadata('AmandaBot', authorname)} ${ran} -o ${ran}`, async (error) => {
									if (error) return reply(mess.error.stick)
									thoth.sendMessage(from, fs.readFileSync(ran), sticker, {quoted: mek})
									fs.unlinkSync(media)
									fs.unlinkSync(ran)
								})
								/*thoth.sendMessage(from, fs.readFileSync(ran), sticker, {quoted: mek})
								fs.unlinkSync(media)
								fs.unlinkSync(ran)*/
							})
							.addOutputOptions([`-vcodec`,`libwebp`,`-vf`,`scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`])
							.toFormat('webp')
							.save(ran)
					} else if ((isMedia || isQuotedImage) && args[0] == 'nobg') {
						const encmedia = isQuotedImage ? JSON.parse(JSON.stringify(mek).replace('quotedM','m')).message.extendedTextMessage.contextInfo : mek
						const media = await thoth.downloadAndSaveMediaMessage(encmedia)
						ranw = getRandom('.webp')
						ranp = getRandom('.png')
						reply(mess.wait)
						keyrmbg = 'Your-ApiKey'
						await removeBackgroundFromImageFile({path: media, apiKey: keyrmbg, size: 'auto', type: 'auto', ranp}).then(res => {
							fs.unlinkSync(media)
							let buffer = Buffer.from(res.base64img, 'base64')
							fs.writeFileSync(ranp, buffer, (err) => {
								if (err) return reply('Falha, ocorreu um erro, tente novamente mais tarde.')
							})
							exec(`ffmpeg -i ${ranp} -vcodec libwebp -filter:v fps=fps=20 -lossless 1 -loop 0 -preset default -an -vsync 0 -s 512:512 ${ranw}`, (err) => {
								fs.unlinkSync(ranp)
								if (err) return reply(mess.error.stick)
								exec(`webpmux -set exif ${addMetadata('BOT', authorname)} ${ranw} -o ${ranw}`, async (error) => {
									if (error) return reply(mess.error.stick)
									thoth.sendMessage(from, fs.readFileSync(ranw), sticker, {quoted: mek})
									fs.unlinkSync(ranw)
								})
								//thoth.sendMessage(from, fs.readFileSync(ranw), sticker, {quoted: mek})
							})
						})
					/*} else if ((isMedia || isQuotedImage) && colors.includes(args[0])) {
						const encmedia = isQuotedImage ? JSON.parse(JSON.stringify(mek).replace('quotedM','m')).message.extendedTextMessage.contextInfo : mek
						const media = await thoth.downloadAndSaveMediaMessage(encmedia)
						ran = getRandom('.webp')
						await ffmpeg(`./${media}`)
							.on('start', function (cmd) {
								console.log('Started :', cmd)
							})
							.on('error', function (err) {
								fs.unlinkSync(media)
								console.log('Error :', err)
							})
							.on('end', function () {
								console.log('Finish')
								fs.unlinkSync(media)
								thoth.sendMessage(from, fs.readFileSync(ran), sticker, {quoted: mek})
								fs.unlinkSync(ran)
							})
							.addOutputOptions([`-vcodec`,`libwebp`,`-vf`,`scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=${args[0]}@0.0, split [a][b]; [a] palettegen=reserve_transparent=off; [b][p] paletteuse`])
							.toFormat('webp')
							.save(ran)*/
					} else {
						reply(`Coloque na legenda da foto ${prefix}s`)
					}
					break
case 'fig':
case 'f':
case 'sherek':					
case 's':
if ((isMedia && !mek.message.videoMessage || isQuotedImage) && args.length == 0) {
const encmedia = isQuotedImage ? JSON.parse(JSON.stringify(mek).replace('quotedM','m')).message.extendedTextMessage.contextInfo : mek
const media = await thoth.downloadAndSaveMediaMessage(encmedia)                                     
rano = getRandom('.webp')
await ffmpeg(`./${media}`)
.input(media)
.on('start', function (cmd) {
console.log(`Started : ${cmd}`)
})
.on('error', function (err) {
console.log(`Error : ${err}`)
exec(`webpmux -set exif ${addMetadata('AmandaBot', 'Sherek')} ${rano} -o ${rano}`, async (error) => {
fs.unlinkSync(media)
reply(ptbr.stick())
})
})
exec(`ffmpeg -i ${media} -vcodec libwebp -filter:v fps=fps=15 -lossless 1 -loop 0 -preset default -an -vsync 0 -s 800:800 ${rano}`, (err) => {
fs.unlinkSync(media)
buffer = fs.readFileSync(rano)
thoth.sendMessage(from, buffer, sticker, {quoted: mek})
fs.unlinkSync(rano)
})
} else if ((isMedia && mek.message.videoMessage.seconds < 11 || isQuotedVideo && mek.message.extendedTextMessage.contextInfo.quotedMessage.videoMessage.seconds < 11) && args.length == 0) {
const encmedia = isQuotedVideo ? JSON.parse(JSON.stringify(mek).replace('quotedM','m')).message.extendedTextMessage.contextInfo : mek
const media = await thoth.downloadAndSaveMediaMessage(encmedia)
rano = getRandom('.webp')
reply(ptbr.waitgif())
await ffmpeg(`./${media}`)
.inputFormat(media.split('.')[1])
.on('start', function (cmd) {
console.log(`Started : ${cmd}`)
})
.on('error', function (err) {
console.log(`Error : ${err}`)
exec(`webpmux -set exif ${addMetadata('AmandaBot', 'Sherek')} ${rano} -o ${rano}`, async (error) => {
fs.unlinkSync(media)
tipe = media.endsWith('.mp4') ? 'video' : 'gif'
reply(`Falha na conversão de ${tipe} para sticker`)
})
})
exec(`ffmpeg -i ${media} -vcodec libwebp -filter:v fps=fps=15 -lossless 1 -loop 0 -preset default -an -vsync 0 -s 200:200 ${rano}`, (err) => {
fs.unlinkSync(media)
buffer = fs.readFileSync(rano)
thoth.sendMessage(from, buffer, sticker, {quoted: mek})
fs.unlinkSync(rano)
})
} else {
reply(`Você precisa enviar ou marcar uma imagem ou vídeo com no máximo 5 segundos`)
}
break		
case 'setprefix':
if (args.length < 1) return
if (!isOwner) return reply(mess.only.ownerB)
prefix = args[0]
setting.prefix = prefix
fs.writeFileSync('./src/settings.json', JSON.stringify(setting, null, '\t'))
reply(`Prefixo mudado para : ${prefix}`)
break
case 'onlyadms':
			if (!isGroupMsg) return await kill.reply(from, mess.sogrupo(), id)
            if (!isGroupAdmins) return await kill.reply(from, mess.soademiro(), id)
            if (!isBotGroupAdmins) return await kill.reply(from, mess.botademira(), id)
			if (args.length !== 1) return await kill.reply(from, mess.onoff(), id)
            if (args[0] == 'on') {
				await kill.setGroupToAdminsOnly(groupId, true).then(async () => { await kill.sendText(from, mess.admson()) })
			} else if (args[0] == 'off') {
				await kill.setGroupToAdminsOnly(groupId, false).then(async () => { await kill.sendText(from, mess.admsoff()) })
			} else return await kill.reply(from, mess.kldica1(), id)
			break
case 'antilink':
			if (isGroupMsg && isGroupAdmins || isGroupMsg && isOwner) {
				if (args.length !== 1) return await kill.reply(from, mess.onoff(), id)
				if (args[0] == 'on') {
					if (atlinks.includes(groupId)) return await kill.reply(from, mess.jaenabled(), id)
					atlinks.push(groupId)
					await fs.writeFileSync('./lib/config/Grupos/antilinks.json', JSON.stringify(atlinks))
					await kill.reply(from, mess.enabled(), id)
				} else if (args[0] == 'off') {
					if (!atlinks.includes(groupId)) return await kill.reply(from, mess.jadisabled(), id)
					atlinks.splice(groupId, 1)
					await fs.writeFileSync('./lib/config/Grupos/antilinks.json', JSON.stringify(atlinks))
					await kill.reply(from, mess.disabled(), id)
				} else return await kill.reply(from, mess.kldica1(), id)
			} else if (isGroupMsg) {
				await kill.reply(from, mess.soademiro(), id)
			} else return await kill.reply(from, mess.sogrupo(), id)
            break
case 'membros':
if (!isGroup) return reply(mess.only.group)
if (!isGroupAdmins) return reply(mess.only.admin)
members_id = []
teks = (args.length > 1) ? body.slice(8).trim() : ''
teks += '\n\n'
for (let mem of groupMembers) {
teks += `*->* @${mem.jid.split('@')[0]}\n`
members_id.push(mem.jid)
}
mentions(teks, members_id, true)
break		
case 'bc':
if (!isOwner) return reply('Você não é o meu dono')
if (args.length < 1) return reply('.......')
anu = await thoth.chats.all()
if (isMedia && !mek.message.videoMessage || isQuotedImage) {
const encmedia = isQuotedImage ? JSON.parse(JSON.stringify(mek).replace('quotedM','m')).message.extendedTextMessage.contextInfo : mek
buff = await thoth.downloadMediaMessage(encmedia)
for (let _ of anu) {
thoth.sendMessage(_.jid, buff, image, {caption: `[Sherek falando]\n\n${body.slice(4)}`})
}
reply('Feito')
} else {
for (let _ of anu) {
sendMess(_.jid, `[ATENÇÃO]\n\n${body.slice(4)}`)
}
reply('Feito')
}
break
case 'notif':
thoth.updatePresence(from, Presence.composing)
if (!isGroup) return reply(mess.only.group)
if (!isGroupAdmins) return reply(mess.only.admin)
teks = body.slice(6)
group = await thoth.groupMetadata(from);
member = group['participants']
jids = [];
member.map(async adm => {
jids.push(adm.id.replace('c.us', 's.whatsapp.net'));
})
options = {
text: teks,
contextInfo: { mentionedJid: jids },
quoted: mek
}
await thoth.sendMessage(from, options, text)
case 'promover':
if (!isGroup) return reply(mess.only.group)
if (!isGroupAdmins) return reply(mess.only.admin)
if (!isBotGroupAdmins) return reply(mess.only.Badmin)
if (mek.message.extendedTextMessage === undefined || mek.message.extendedTextMessage === null) return
mentioned = mek.message.extendedTextMessage.contextInfo.mentionedJid
if (mentioned.length > 1) {
teks = 'Membro promovido\n'
for (let _ of mentioned) {
teks += `@${_.split('@')[0]}\n`
}
mentions(from, mentioned, true)
thoth.groupRemove(from, mentioned)
} else {
mentions(`@${mentioned[0].split('@')[0]} virou adm!`, mentioned, true)
thoth.groupMakeAdmin(from, mentioned)
}
break
case 'gostosas':
      if (!isGroup) return reply(mess.only.group)
                        member = []
                        const p1 = groupMembers
                        const p2 = groupMembers
                        const p3 = groupMembers
                        const p4 = groupMembers
                        const p5 = groupMembers
                        const o1 = p1[Math.floor(Math.random() * p1.length)]
                        const o2 = p2[Math.floor(Math.random() * p2.length)]
                        const o3 = p3[Math.floor(Math.random() * p3.length)]
                        const o4 = p4[Math.floor(Math.random() * p4.length)]
                        const o5 = p5[Math.floor(Math.random() * p5.length)]
                        teks = `
                  Paradas!\n\n@${o1.jid.split('@')[0]}\n\n\n${o2.jid.split('@')[0]}\n\n\n${o3.jid.split('@')[0]}\n\n\n${o4.jid.split('@')[0]}\n\n\n@${o5.jid.split('@')[0]}\n\n\nMultadas por serem gostosas demais, paguem sua multa enviando nude no PV do meu dono, by AmandaBot`
                        member.push(o1.jid)
                        member.push(o2.jid)
                        member.push(o3.jid)
                        member.push(o4.jid)
                        member.push(o5.jid)
                        mentions(teks, member, true)
break 
case 'fechar':
thoth.updatePresence(from, Presence.composing)
if (!isGroup) return reply(mess.only.group)
if (!isGroupAdmins) return reply(mess.only.admin)
if (!isBotGroupAdmins) return reply(mess.only.Badmin)
var nomor = mek.participant
const close = {
text: `@${nomor.split("@s.whatsapp.net")[0]}\nfechou o grupo`,
contextInfo: { mentionedJid: [nomor] }
}
thoth.groupSettingChange(from, GroupSettingChange.messageSend, true);
reply(close)
break
case 'abrir':
thoth.updatePresence(from, Presence.composing)
if (!isGroup) return reply(mess.only.group)
if (!isGroupAdmins) return reply(mess.only.admin)
if (!isBotGroupAdmins) return reply(mess.only.Badmin)
open = {
text: `@${sender.split("@")[0]}\nabriu o grupo`,
contextInfo: { mentionedJid: [sender] }
}
thoth.groupSettingChange(from, GroupSettingChange.messageSend, false)
thoth.sendMessage(from, open, text, { quoted: mek })
break
case 'add':
            if (!isGroupMsg) return await kill.reply(from, mess.sogrupo(), id)
            if (!isGroupAdmins) return await kill.reply(from, mess.soademiro(), id)
            if (!isBotGroupAdmins) return await kill.reply(from, mess.botademira(), id)
	        if (args.length !== 1 && isNaN(args[0])) return await kill.reply(from, mess.usenumber(), id)
			if (groupMembersId.includes(args[0] + '@c.us')) return await kill.reply(from, mess.janogp(), id)
            try {
                await kill.addParticipant(from,`${args[0]}@c.us`)
            } catch (error) { 
				await kill.reply(from, mess.addpessoa(), id)
				console.log(color('[ADICIONAR]', 'crimson'), color(`→ Obtive erros no comando ${prefix}${command} → ${error.message} - Você pode ignorar.`, 'gold'))
			}
            break
			case 'attp':
			if (args.length == 0) return await kill.reply(from, mess.noargs() + 'palavras/números.', id)
			await kill.reply(from, mess.wait(), id)
			await axios.get(`https://api.xteam.xyz/attp?file&text=${encodeURIComponent(body.slice(6))}`, { responseType: 'arraybuffer' }).then(async (response) => {
				const attp = Buffer.from(response.data, 'binary').toString('base64')
				await kill.sendImageAsSticker(from, attp, { author: config.author, pack: config.pack, keepScale: true })
			})
			break
			case 'wasted':
            if (isMedia && type === 'image' || isQuotedImage) {
                await kill.reply(from, mess.wait(), id)
                const wastedmd = isQuotedImage ? quotedMsg : message
                const wstddt = await decryptMedia(wastedmd, uaOverride)
				const wastedUpl = await upload(wstddt, false)
                await kill.sendFileFromUrl(from, `https://some-random-api.ml/canvas/wasted?avatar=${wastedUpl}`, 'Wasted.jpg', mess.wasted(), id).catch(async () => { await kill.reply(from, mess.upfail(), id) })
            } else return await kill.reply(from, mess.onlyimg(), id)
            break
        case 'trigger':
            if (isMedia && type === 'image' || isQuotedImage) {
                await kill.reply(from, mess.wait(), id)
                const triggermd = isQuotedImage ? quotedMsg : message
                const upTrigger = await decryptMedia(triggermd, uaOverride)
				const getTrigger = await upload(upTrigger, false)
				await axios.get(`https://some-random-api.ml/canvas/triggered?avatar=${getTrigger}`, { responseType: 'arraybuffer' }).then(async (response) => {
					const theTigger = Buffer.from(response.data, 'binary').toString('base64')
					await kill.sendImageAsSticker(from, theTigger, { author: config.author, pack: config.pack, keepScale: true })
				}).catch(async () => { await kill.reply(from, mess.upfail(), id) })
            } else return await kill.reply(from, mess.onlyimg(), id)
            break
case 'wame':;case 'wa.me':
			if (quotedMsg) {
				await kill.reply(from, `📞 - https://wa.me/${quotedMsgObj.sender.id.replace('@c.us', '')} - ${quotedMsgObj.sender.id.replace('@c.us', '')}`, id)
			} else if (mentionedJidList.length !== 0) {
				var wame = ''
				for (let i = 0; i < mentionedJidList.length; i++) { wame += `\n📞 - https://wa.me/${mentionedJidList[i].replace('@c.us', '')} - @${mentionedJidList[i].replace('@c.us', '')}` }
				await kill.sendTextWithMentions(from, wame, id)
			} else return await kill.reply(from, `📞 - https://wa.me/${user.replace('@c.us', '')} - ${user.replace('@c.us', '')}`, id)
			break
case 'cassino':
			var checkxpc = await getXp(user, nivel)
			const xpMenor = parseInt(checkxpc / 2, 10)
			if (isNaN(args[0]) || !isInt(args[0]) || Number(args[0]) >= xpMenor || Number(args[0]) < 250) return await kill.reply(from, mess.gaming(checkxpc, xpMenor), id)
			var ncasxp = Math.floor(Math.random() * -milSort) - Number(args[0])
			var pcasxp = Math.floor(Math.random() * milSort) + Number(args[0])
            const limitcs = await getLimit(user, daily)
            if (limitcs !== undefined && cd - (Date.now() - limitcs) > 0) {
				const time = ms(cd - (Date.now() - limitcs))
                await kill.reply(from, mess.limitgame(), id)
			} else {
				var cassin = ['🍒', '🎃', '🍐']
				const cassin1 = cassin[Math.floor(Math.random() * cassin.length)]
				const cassin2 = cassin[Math.floor(Math.random() * cassin.length)]
				const cassin3 = cassin[Math.floor(Math.random() * cassin.length)]
				var cassinend = cassin1 + cassin2 + cassin3
				if (cassinend == '🍒🍒🍒' || cassinend == '🎃🎃🎃' || cassinend == '🍐🍐🍐') {
					await kill.reply(from, mess.caswin(cassin1, cassin2, cassin3, pcasxp), id)
					await sleep(2000)
					await addXp(user, Number(pcasxp), nivel)
				} else {
					await kill.reply(from, mess.caslose(cassin1, cassin2, cassin3, ncasxp), id)
					await sleep(2000)
					await addXp(user, Number(ncasxp), nivel)
				}
				await addLimit(user, daily) 
			}
			break
case 'criador':
			await kill.reply(from, `☀️ - Host: https://wa.me/${config.owner[0].replace('@c.us', '')}\nSherek: https://wa.me/557499260572`, id)
			await kill.reply(from, mess.everhost(), id)
            break
case 'play':
            if (args.length == 0) return await kill.reply(from, mess.noargs() + 'Títulos do YouTube/YouTube Titles.', id)
			try {
				await kill.reply(from, mess.wait(), id)
				const ytres = await ytsearch(`${body.slice(6)}`)
				await kill.sendYoutubeLink(from, `${ytres.all[0].url}`, '\n' + mess.play(ytres))
				await youtubedl(`https://youtu.be/${ytres.all[0].videoId}`, { noWarnings: true, noCallHome: true, noCheckCertificate: true, preferFreeFormats: true, youtubeSkipDashManifest: true, referer: `https://youtu.be/${ytres.all[0].videoId}`, x: true, audioFormat: 'mp3', o: `./lib/media/audio/${user.replace('@c.us', '')}${lvpc}.mp3` }).then(async () => { await kill.sendPtt(from, `./lib/media/audio/${user.replace('@c.us', '')}${lvpc}.mp3`, id) })
				await sleep(10000).then(async () => { await fs.unlinkSync(`./lib/media/audio/${user.replace('@c.us', '')}${lvpc}.mp3`) })
			} catch (error) {
				await kill.reply(from, mess.verybig(), id)
				console.log(color('[PLAY]', 'crimson'), color(`→ Obtive erros no comando ${prefix}${command} → ${error.message} - Você pode ignorar.`, 'AmantaBot'))
			}
            break
case 'rebaixar':
if (!isGroup) return reply(mess.only.group)
if (!isGroupAdmins) return reply(mess.only.admin)
if (!isBotGroupAdmins) return reply(mess.only.Badmin)
if (mek.message.extendedTextMessage === undefined || mek.message.extendedTextMessage === null) return
mentioned = mek.message.extendedTextMessage.contextInfo.mentionedJid
if (mentioned.length > 1) {
teks = 'Tirando o cargo\n'
for (let _ of mentioned) {
teks += `@${_.split('@')[0]}\n`
}
mentions(teks, mentioned, true)
thoth.groupRemove(from, mentioned)
} else {
mentions(`@${mentioned[0].split('@')[0]} membro rebaixado`, mentioned, true)
thoth.groupDemoteAdmin(from, mentioned)
}
break
case 'ghost':
            if (!isGroupMsg) return await kill.reply(from. mess.sogrupo(), id)
			if (!isGroupAdmins) return await kill.reply(from, mess.soademiro(), id)
			if (!isBotGroupAdmins) return await kill.reply(from, mess.botademira(), id)
			if (isNaN(args[0])) return await kill.reply(from, mess.kickcount(), id)
			await kill.reply(from, mess.wait(), id)
			var userRem = `Removidos ↓\n\n`
            try {
				welkom.splice(groupId, 1)
				await fs.writeFileSync('./lib/config/Grupos/welcome.json', JSON.stringify(welkom))
                for (let i = 0; i < groupMembers.length; i++) {
					const msgCount = await getMsg(groupMembers[i].id, msgcount)
					if (groupAdmins.includes(groupMembers[i].id) || botNumber.includes(groupMembers[i].id) || ownerNumber.includes(groupMembers[i].id)) {
						console.log(color(' ', 'crimson'), groupMembers[i].id)
					} else {
						if (msgCount < Number(args[0])) {
							await kill.removeParticipant(groupId, groupMembers[i].id)
							userRem += `@${groupMembers[i].id}\n\n`
						}
					}
				}
                await kill.sendTextWithMentions(from, userRem.replace('@c.us', ''))
				welkom.push(groupId)
				await fs.writeFileSync('./lib/config/Grupos/welcome.json', JSON.stringify(welkom))
            } catch (err) { await kill.reply(from, mess.fail() + '\nMaybe mistake/Talvez engano/0 removidos/0 removed.', id) }
            break
			
			
		case 'ativos':
            if (!isGroupMsg) return await kill.reply(from, mess.sogrupo(), id)
			msgcount.sort((a, b) => (a.msg < b.msg) ? 1 : -1)
            let active = '-----[ *RANKING DOS ATIVOS* ]----\n\n'
            try {
                for (let i = 0; i < 10; i++) {
					const aRandVar = await kill.getContact(msgcount[i].id)
					var getPushname = aRandVar.pushname
					if (getPushname == null) getPushname = 'wa.me/' + msgcount[i].id.replace('@c.us', '')
					active += `${i + 1} → *${getPushname}*\n➸ *Mensagens*: ${msgcount[i].msg}\n\n`
				}
                await kill.sendText(from, active)
            } catch (error) { 
				await kill.reply(from, mess.tenpeo(), id)
				console.log(color('[ATIVOS]', 'crimson'), color(`→ Obtive erros no comando ${prefix}${command} → ${error.message} - Você pode ignorar.`, 'AmandaBot'))
			}
            break
case 'admins':
			if (!isGroupMsg) return await kill.reply(from, mess.sogrupo(), id)
            if (!isGroupAdmins && !isOwner) return await kill.reply(from, mess.soademiro(), id)
            await kill.sendText(from, mess.admins())
            break
case 'join':
            if (args.length == 0) return await kill.reply(from, mess.nolink(), id)
            const gplk = body.slice(6)
            const tGr = await kill.getAllGroups()
            const isLink = gplk.match(/(https:\/\/chat.whatsapp.com)/gi)
            const check = await kill.inviteInfo(gplk)
			const memberlmt = check.size
            if (!isLink) return await kill.reply(from, mess.nolink(), id)
            if (tGr.length > config.gpLimit) return await kill.reply(from, mess.cheio(tGr), id)
            if (memberlmt < config.memberReq) return await kill.reply(from, mess.noreq(memberlmt), id)
            if (check.status == 200) {
                await kill.joinGroupViaLink(gplk).then(async () => { await kill.reply(from, mess.maked()) })
            } else return await kill.reply(from, mess.fail(), id)
            break
case 'ban':;case 'banir':
					if (!isOwner) return reply(mess.only.ownerB)
					client.banUser (`${body.slice(7)}@c.us`, "add")
					client.sendMessage(from, `Tchau ${body.slice(7)}@c.us`, text)
					break
break
case 'link':
if (!isGroup) return reply(mess.only.group)
if (!isGroupAdmins) return reply(mess.only.admin)
if (!isBotGroupAdmins) return reply(mess.only.Badmin)
linkgc = await thoth.groupInviteCode(from)
reply('https://chat.whatsapp.com/'+linkgc)
break
case 'sound':;case 'bass':
			if (isMedia && isAudio || isQuotedAudio || isPtt || isQuotedPtt) {
				if (args.length == 1 && !isNaN(args[0])) {
					try {
						await kill.reply(from, mess.wait(), id)
						const encryptMedia = isQuotedAudio || isQuotedPtt ? quotedMsg : message
						const mediaData = await decryptMedia(encryptMedia, uaOverride)
						await fs.writeFile(`./lib/media/audio/${user.replace('@c.us', '')}${lvpc}.mp3`, mediaData, (err) => {
							if (err) return console.error(err)
							console.log(color('[FFMPEG]', 'crimson'), color(`- Conversão de audio "Bass" pedida por → ${pushname} - Você pode ignorar.`, 'gold'))
							ffmpeg(`./lib/media/audio/${user.replace('@c.us', '')}${lvpc}.mp3`).audioFilter(`equalizer=f=40:width_type=h:width=50:g=${args[0]}`).format('mp3').save(`./lib/media/audio/audio-${user.replace('@c.us', '')}${lvpc}.mp3`) // Você pode editar o equalizador ali
							.on('error', async function (error, stdout, stderr) {
								await kill.reply(from, mess.fail(), id)
								console.log(color('[BASS]', 'crimson'), color(`→ Obtive erros no comando ${prefix}${command} → ${error.message} - Você pode ignorar.`, 'gold'))
							})
							.on('end', async () => {
								console.log(color('[FFMPEG]', 'crimson'), color(`- Conversão de audio "Bass" finalizada, enviando para → ${pushname} - Você pode ignorar...`, 'gold'))
								await kill.sendFile(from, `./lib/media/audio/audio-${user.replace('@c.us', '')}${lvpc}.mp3`, 'audio.mp3', '', id)
								await sleep(10000).then(async () => { await fs.unlinkSync(`./lib/media/audio/audio-${user.replace('@c.us', '')}${lvpc}.mp3`);await fs.unlinkSync(`./lib/media/audio/${user.replace('@c.us', '')}${lvpc}.mp3`) })
							})
						})
					} catch (error) {
						await kill.reply(from, mess.fail(), id)
						console.log(color('[BASS]', 'crimson'), color(`→ Obtive erros no comando ${prefix}${command} → ${error.message} - Você pode ignorar.`, 'gold'))
					}
				} else return await kill.reply(from, mess.noargs() + 'quantidade de bass | bass quantity.', id)
			} else return await kill.reply(from, mess.onlyaudio(), id)
			break
		case 'nightcore':
			if (isMedia && isAudio || isQuotedAudio || isPtt || isQuotedPtt) {
				try {
					await kill.reply(from, mess.wait(), id)
					const encryptMedia = isQuotedAudio || isQuotedPtt ? quotedMsg : message
					const mediaData = await decryptMedia(encryptMedia, uaOverride)
					await fs.writeFile(`./lib/media/audio/n${user.replace('@c.us', '')}${lvpc}.mp3`, mediaData, (err) => {
						if (err) return console.error(err)
						console.log(color('[FFMPEG]', 'crimson'), color(`- Conversão de audio para versão "nightcore" pedida por → ${pushname} - Você pode ignorar.`, 'gold'))
						ffmpeg(`./lib/media/audio/n${user.replace('@c.us', '')}${lvpc}.mp3`).audioFilter('asetrate=44100*1.25').format('mp3').save(`./lib/media/audio/night-${user.replace('@c.us', '')}${lvpc}.mp3`) // Você pode editar o valor acima (44100*1.25)
						.on('error', async function (error, stdout, stderr) {
							await kill.reply(from, mess.fail(), id)
							console.log(color('[NIGHTCORE]', 'crimson'), color(`→ Obtive erros no comando ${prefix}${command} → ${error.message} - Você pode ignorar.`, 'gold'))
						})
						.on('end', async () => {
							console.log(color('[FFMPEG]', 'crimson'), color(`- Conversão de audio para versão "nightcore" finalizada, enviando para → ${pushname} - Você pode ignorar...`, 'gold'))
							await kill.sendFile(from, `./lib/media/audio/night-${user.replace('@c.us', '')}${lvpc}.mp3`, 'audio.mp3', '', id)
							await sleep(10000).then(async () => { await fs.unlinkSync(`./lib/media/audio/night-${user.replace('@c.us', '')}${lvpc}.mp3`);await fs.unlinkSync(`./lib/media/audio/n${user.replace('@c.us', '')}${lvpc}.mp3`) })
						})
					})
				} catch (error) {
					await kill.reply(from, mess.fail(), id)
					console.log(color('[NIGHTCORE]', 'crimson'), color(`→ Obtive erros no comando ${prefix}${command} → ${error.message} - Você pode ignorar.`, 'gold'))
				}
			} else return await kill.reply(from, mess.onlyaudio(), id)
			break
		case 'audio':
			if (isMedia && isVideo || isQuotedVideo) {
				try {
					await kill.reply(from, mess.wait(), id)
					const vTypeA = isQuotedVideo ? quotedMsg : message
					const mediaData = await decryptMedia(vTypeA, uaOverride)
					await fs.writeFile(`./lib/media/video/${user.replace('@c.us', '')}${lvpc}.${vTypeA.mimetype.replace(/.+\//, '')}`, mediaData, (err) => {
						if (err) return console.error(err)
						console.log(color('[FFMPEG]', 'crimson'), color(`- Conversão de video para audio pedida por → ${pushname} - Você pode ignorar.`, 'gold'))
						ffmpeg(`./lib/media/video/${user.replace('@c.us', '')}${lvpc}.${vTypeA.mimetype.replace(/.+\//, '')}`).format('mp3').save(`./lib/media/video/v${user.replace('@c.us', '')}${lvpc}.mp3`)
						.on('error', async function (error, stdout, stderr) {
							await kill.reply(from, mess.fail(), id)
							console.log(color('[AUDIO]', 'crimson'), color(`→ Obtive erros no comando ${prefix}${command} → ${error.message} - Você pode ignorar.`, 'gold'))
						})
						.on('end', async () => {
							console.log(color('[FFMPEG]', 'crimson'), color(`- Conversão de video para audio terminada, enviando para → ${pushname} - Você pode ignorar...`, 'gold'))
							await kill.sendFile(from, `./lib/media/video/v${user.replace('@c.us', '')}${lvpc}.mp3`, 'audio.mp3', '', id)
							await sleep(10000).then(async () => { await fs.unlinkSync(`./lib/media/video/v${user.replace('@c.us', '')}${lvpc}.mp3`);await fs.unlinkSync(`./lib/media/video/${user.replace('@c.us', '')}${lvpc}.${vTypeA.mimetype.replace(/.+\//, '')}`) })
						})
					})
				} catch (error) {
					await kill.reply(from, mess.fail(), id)
					console.log(color('[AUDIO]', 'crimson'), color(`→ Obtive erros no comando ${prefix}${command} → ${error.message} - Você pode ignorar.`, 'gold'))
				}
			} else return await kill.reply(from, mess.onlyvideo(), id)
			break
case 'marcar':
			await kill.sendTextWithMentions(from, `@${user.replace('@c.us', '')}`)
			break
						case 'hidetag':
					if (!isGroup) return reply(mess.only.group)
					if (!isGroupAdmins) return reply(mess.only.group)
					var value = body.slice(9)
					var group = await client.groupMetadata(from)
					var member = group['participants']
					var mem = []
					member.map( async adm => {
					mem.push(adm.id.replace('c.us', 's.whatsapp.net'))
					})
					var options = {
					text: value,
					contextInfo: { mentionedJid: mem },
					quoted: mek
					}
					client.sendMessage(from, options, text)
					break
case 'sair':
if (!isGroup) return reply(mess.only.group)
if (isGroupAdmins || isOwner) {
thoth.groupLeave(from)
} else {
reply(mess.only.admin)
}
break
case 'img':
if (!isGroup) return reply(mess.only.group)
if (!isQuotedSticker) return reply(' marque um sticker ')
reply(mess.wait)
encmedia = JSON.parse(JSON.stringify(mek).replace('quotedM','m')).message.extendedTextMessage.contextInfo
media = await thoth.downloadAndSaveMediaMessage(encmedia)
ran = getRandom('.png')
exec(`ffmpeg -i ${media} ${ran}`, (err) => {
fs.unlinkSync(media)
if (err) return reply(' Só sticker sem movimento ')
buffer = fs.readFileSync(ran)
thoth.sendMessage(from, buffer, image, {quoted: mek, caption: 'O Sherek quer foto da sua buceta, mande para ele\nwa.me/557499260572'})
fs.unlinkSync(ran)
})
break
case 'welcome':
if (!isGroup) return reply(mess.only.group)
if (!isGroupAdmins) return reply(mess.only.admin)
if (args.length < 1) return reply('para ativar digite, welcome 1, para desativar digite, welcome 0')
if (Number(args[0]) === 1) {
if (isWelkom) return reply('Já ativo')
welkom.push(from)
fs.writeFileSync('./src/welkom.json', JSON.stringify(welkom))
reply('Ativado com sucesso ✔️')
} else if (Number(args[0]) === 0) {
welkom.splice(from, 1)
fs.writeFileSync('./src/welkom.json', JSON.stringify(welkom))
reply('Desativado com sucesso ✔️')
} else {
reply('1 para ativar, 0 para desativar')
}
                                      break
				default:
					if (isGroup && isSimi && budy != undefined) {
						console.log(budy)
						muehe = await simih(budy)
						console.log(muehe)
						reply(muehe)
					} else {
						return //console.log(color('[WARN]','red'), 'Unregistered Command from', color(sender.split('@')[0]))
					}
                           }
		} catch (e) {
			console.log('Error : %s', color(e, 'red'))
		}
	})
}
starts()
