(function() {
	const l = console.log;

	const VIEWS = ['Текст', 'Bin', 'Hex'];
	let baseView = 0, cipherView = 0;
	const toggleView = (selector, view) => {
		const initState = $(`#${selector}`).val();
		const newState = [
			Converter.strToBin.bind(Converter),
			Converter.binToHex.bind(Converter),
			Converter.hexToStr.bind(Converter)
		][view](initState);
		$(`#${selector}`).val(newState);
	};

	const getBaseBits = () => [
		Converter.strToBin.bind(Converter),
		bin => bin,
		Converter.hexToBin.bind(Converter)
	][baseView]($('#base-text').val());

	const fillGamma = gamma => {
		$('#gamma').val(gamma);
		$('#cipher-apply').prop('disabled', false);
		makeResearch(gamma);
	};

	$('#gamma').on('change input', function() {
		$('#cipher-apply').prop('disabled', !$(this).val());
	});

	$('#random-gamma-button').on('click', function() {
		const strBits = getBaseBits();

		const newGamma = Gamma.getSimpleGamma(strBits.length);
		fillGamma(newGamma);
	});

	$('#scrambler-gamma-button').on('click', function() {
		const strBits = getBaseBits();
		const polynom = $('#polynom').val();
		const initialValue = $('#initial-value').val();

		const newGamma = Gamma.getScramblerGamma(strBits.length, polynom, initialValue);
		$('#scrambler-period').text(newGamma.period);
		fillGamma(newGamma.gamma);
	});

	$('#cipher-apply').on('click', function() {
		const gamma = $('#gamma').val();
		const strBits = getBaseBits();

		const cipher = [
			Converter.binToStr.bind(Converter),
			bin => bin,
			Converter.binToHex.bind(Converter)
		][cipherView](Gamma.apply(gamma, strBits));

		$('#cipher-text').val(cipher);
	});

	$('#view-toggler-base').on('click', function() {
		toggleView('base-text', baseView);
		baseView = (baseView + 1) % VIEWS.length;
		$(this).text(VIEWS[baseView]);
	});

	$('#view-toggler-cipher').on('click', function() {
		toggleView('cipher-text', cipherView);
		cipherView = (cipherView + 1) % VIEWS.length;
		$(this).text(VIEWS[cipherView]);
	});

	function makeResearch(gamma) {
		const set = gamma;
		const chi2Test = () => {
			const chi2 = Statistics.chiSquaredTest(set);
			$('#chi2-value').text(chi2.chi2.toFixed(4));
			$('#chi2-critical').text(chi2.criticalValue.toFixed(4));
			$('#chi2-succeed').text({
				true: 'Да',
				false: 'Нет'
			}[chi2.isDistributionUniform.toString()]);
		};

		const balanceTest = () => {
			const balance = Statistics.balanceTest(set);
			$('#balanced-test-text').text(
				balance
					.map((range, index) => `${index + 1}(${range.length}): Разница составила ${(range.difference * 100).toFixed(0)}%, тест ${
							{true: 'успешен', false: 'провален'}[range.testSucceed]
						}`
					)
					.join('\n')
			);

			$('#balanced-succeed').text({
				true: 'Да',
				false: 'Нет'
			}[balance.testSucceed.toString()]);
		};

		const cyclicityTest = () => {
			const cyclicity = Statistics.cyclicityTest(set);
			$('#cyclicity-test-text').text(
				cyclicity
					.map((range, index) => `${index + 1}: Ожидалось ${range.expected.toFixed(4)}, фактически имеется ${range.actual.toFixed(4)}, тест ${
							{true: 'успешен', false: 'провален'}[range.testSucceed]
						}`
					)
					.join('\n')
			);

			$('#cyclicity-succeed').text({
				true: 'Да',
				false: 'Нет'
			}[cyclicity.testSucceed.toString()]);
		};

		const correlationTest = () => {
			const correlation = Statistics.correlationTest(set);
			$('#correlation-test-text').text(
				correlation
					.map((range, index) => `Сдвиг на ${index + 1}: ${range.accordances} совпадений, ${range.disaccordances} отличий, разница: ${(range.difference_percent * 100).toFixed(0)}%, тест ${
							{true: 'успешен', false: 'провален'}[range.testSucceed]
						}`
					)
					.join('\n')
			);

			$('#correlation-succeed').text({
				true: 'Да',
				false: 'Нет'
			}[correlation.testSucceed.toString()]);
		};

		chi2Test();
		balanceTest();
		cyclicityTest();
		correlationTest();
	}
})();