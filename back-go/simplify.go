package main

func getSqDist(p1 *Point, p2 *Point) float64 {

	dx := p1.X - p2.X
	dy := p1.Y - p2.Y

	return dx*dx + dy*dy
}

func getSqSegDist(p *Point, p1 *Point, p2 *Point) float64 {

	x := p1.X
	y := p1.Y
	dx := p2.X - x
	dy := p2.Y - y

	if dx != 0 || dy != 0 {
		t := ((p.X-x)*dx + (p.Y-y)*dy) / (dx*dx + dy*dy)

		if t > 1 {
			x = p2.X
			y = p2.Y
		} else if t > 0 {
			x += dx * t
			y += dy * t
		}
	}

	dx = p.X - x
	dy = p.Y - y

	return dx*dx + dy*dy
}

func simplifyRadialDist(points []*Point, sqTolerance float64) []*Point {

	prevPoint := points[0]
	newPoints := []*Point{prevPoint}
	var point *Point

	for i := 1; i < len(points); i++ {
		point = points[i]

		if getSqDist(point, prevPoint) > sqTolerance {
			newPoints = append(newPoints, point)
			prevPoint = point
		}
	}

	if &prevPoint != &point {
		newPoints = append(newPoints, point)
	}

	return newPoints
}

func simplifyDPStep(points []*Point, first int, last int, sqTolerance float64, simplified []*Point) []*Point {
	maxSqDist := sqTolerance
	var index int

	for i := first + 1; i < last; i++ {
		sqDist := getSqSegDist(points[i], points[first], points[last])

		if sqDist > maxSqDist {
			index = i
			maxSqDist = sqDist
		}
	}

	if maxSqDist > sqTolerance {
		if index-first > 1 {
			simplified = simplifyDPStep(points, first, index, sqTolerance, simplified)
		}
		simplified = append(simplified, points[index])
		if last-index > 1 {
			simplified = simplifyDPStep(points, index, last, sqTolerance, simplified)
		}
	}

	return simplified
}

func simplifyDouglasPeucker(points []*Point, sqTolerance float64) []*Point {
	last := len(points) - 1

	simplified := []*Point{points[0]}
	simplified = simplifyDPStep(points, 0, last, sqTolerance, simplified)
	simplified = append(simplified, points[last])

	return simplified
}

func Simplify(points []*Point, tolerance float64, highestQuality bool) []*Point {
	arr := points

	if len(arr) <= 2 {
		return arr
	}

	var sqTolerance float64
	if tolerance == 0 {
		sqTolerance = 1
	} else {
		sqTolerance = tolerance * tolerance
	}

	if !highestQuality {
		arr = simplifyRadialDist(arr, sqTolerance)
	}

	arr = simplifyDouglasPeucker(arr, sqTolerance)

	return arr
}
