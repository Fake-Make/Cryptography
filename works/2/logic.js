console.log(`---=========---`);
console.log(`Preparing`);
const str = 'Hello World!';
const strBits = Converter.strToBin(str);
console.log(`${str}: ${strBits}`);
const key = Gamma.getScramblerGamma(32).gamma;
console.log(`Key: ${key}`);

console.log(`---=========---`);
console.log(`Ciphering`);
const feistel = [0, 1, 2, 3]
	.map(vfCase => new FeistelsNetwork(key, vfCase));
const ciphers = feistel.map(feistel => feistel.apply(strBits));
const avalances = feistel.map(feistel => feistel.getAvalanche());
ciphers.forEach((cipher, index) => 
		console.log(`Case #${index}: ${Converter.binToStr(cipher)} (${cipher})`)
	);
console.log(avalances);

console.log(`---=========---`);
console.log(`Deciphering`);
const deciphers = [0, 1, 2, 3]
	.map(vfCase => new FeistelsNetwork(key, vfCase).apply(ciphers[vfCase], false));
deciphers.forEach((decipher, index) => 
	console.log(`Case #${index}: ${Converter.binToStr(decipher)} (${decipher})`)
);